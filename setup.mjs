// 西安理工大学武术太极社 - 一键设置脚本
// 在终端运行: node setup.mjs

const SUPABASE_URL = 'https://grqfcmjhcknnqgrfyqjq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdycWZjbWpoY2tubnFncmZ5cWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NTQwODQsImV4cCI6MjEwMDUzMDA4NH0.r1AcMNiKI88mEhJgufeDycXu8EhfLP4tCHvKfgd3sNE';

async function main() {
  console.log('\\n=== 西安理工大学武术太极社 网站设置脚本 ===\\n');
  
  // 1. 创建管理员账号
  console.log('[1/3] 注册管理员账号...');
  const signupRes = await fetch(SUPABASE_URL + '/auth/v1/signup', {
    method: 'POST',
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: '3242211016@xaut.edu.cn',
      password: 'qbz1395555',
      data: {
        name: 'qbz1395555',
        student_id: '3242211016',
        nickname: '\u6478\u624b\u7684\u9c7c',
        avatar: 'apple',
        role: 'member'
      }
    })
  });
  const signupData = await signupRes.json();
  if (signupRes.ok) {
    console.log('   \\u2713 账号注册成功！');
    console.log('   \\u2192 请去注册邮箱验证（或Supabase关闭邮箱验证则直接可用）');
  } else {
    if (signupData.msg?.includes('already')) {
      console.log('   \\u2713 账号已存在，跳过注册');
    } else {
      console.log('   \\u00d7 注册失败:', signupData.msg || JSON.stringify(signupData));
    }
  }

  // 2. 提示执行SQL
  console.log('\\n[2/3] 数据库初始化');
  console.log('   \\u2192 请打开 Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard/project/grqfcmjhcknnqgrfyqjq');
  console.log('   \\u2192 左侧菜单 -> SQL Editor');
  console.log('   \\u2192 把 supabase-schema.sql 所有内容复制进去执行');
  console.log('   \\u2192 然后去 Storage 创建5个公开bucket:');
  console.log('     - post-images');
  console.log('     - activity-images');
  console.log('     - ads');
  console.log('     - site-assets');
  console.log('     - avatars');
  
  // 3. 设置管理员角色
  console.log('\\n[3/3] 设置超级管理员');
  console.log('   执行完SQL后，在同一个SQL Editor运行:');
  console.log('   \\n   UPDATE public.users SET role = \\'super_admin\\' WHERE student_id = \\'3242211016\\';');
  console.log('   \\n   或者去 Table Editor -> users 表');
  console.log('   找到你的记录，把 role 改成 super_admin\\n');
  
  console.log('=== 设置完成！=== \\n');
  console.log('然后运行 pnpm dev 启动网站');
  console.log('用学号 3242211016 / 密码 qbz1395555 登录');
  console.log('访问 /admin 进入管理后台');
}

main().catch(console.error);
