# 使用 Node.js 18 作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json
COPY package.json package-lock.json ./

# 安装后端依赖
RUN npm install --omit=dev

# 复制 `server/` 目录的所有文件
COPY . .

# 编译 TypeScript
RUN npm run build

# 暴露端口
EXPOSE 3000

# 运行服务器
CMD ["node", "dist/server.js"]
