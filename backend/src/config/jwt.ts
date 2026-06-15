export const loadEnv = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config();
};

loadEnv();

const rawSecret = process.env.JWT_SECRET;

if (!rawSecret || rawSecret.length < 16) {
  console.error('❌ 错误：JWT_SECRET 环境变量未设置或强度不足。');
  console.error('   请在 backend/.env 文件中配置至少16字符的随机密钥。');
  console.error('   可参考 backend/.env.example 模板进行配置。');
  process.exit(1);
}

export const JWT_SECRET: string = rawSecret;
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';
export const PORT: number = parseInt(process.env.PORT || '8002', 10);
