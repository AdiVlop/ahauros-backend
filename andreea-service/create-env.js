import fs from 'fs';

const envContent = `OPENAI_API_KEY=your-openai-api-key-here
PORT=8001`;

fs.writeFileSync('.env', envContent);
console.log('✅ .env file created successfully');
