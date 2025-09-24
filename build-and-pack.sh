#!/bin/bash

# 构建脚本 - 自动增加版本号并打包

echo "🚀 开始构建流程..."

# 获取当前版本号
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "当前版本: $CURRENT_VERSION"

# 解析版本号
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# 增加 patch 版本号 0.01 (实际上是 +1)
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

echo "新版本: $NEW_VERSION"

# 更新 package.json 中的版本号
npm version $NEW_VERSION --no-git-tag-version

echo "✅ 版本号已更新到 $NEW_VERSION"

# 构建包
echo "📦 开始构建..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建完成"

# 进入 dist 目录打包
cd dist

# 创建 tgz 包
echo "📦 正在打包..."
npm pack

if [ $? -ne 0 ]; then
    echo "❌ 打包失败"
    exit 1
fi

# 移动 tgz 文件到项目根目录
TGZ_FILE=$(ls *.tgz | head -1)
mv "$TGZ_FILE" ../

cd ..

echo "🎉 构建完成!"
echo "📦 包文件: $TGZ_FILE"
echo "🏷️  版本: $NEW_VERSION"
echo ""
echo "你可以使用以下命令安装本地包:"
echo "npm install ./$TGZ_FILE"