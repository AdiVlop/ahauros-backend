import { execSync } from "child_process";
import fs from "fs";

console.log("🔐 Auto-copying secrets from source repo to PayAiX organization...");

try {
  const sourceRepo = "AdiVlop/ahauros-dashboard";
  const targetOrg = "PayAiX";
  
  // Lista de secrets
  const secrets = [
    "AWS_ACCESS_KEY_ID",
    "AWS_REGION", 
    "AWS_SECRET_ACCESS_KEY",
    "AWS_SES_EMAIL",
    "AWS_SES_PASSWORD",
    "CLOUDFRONT_DISTRIBUTION_ID",
    "JWT_SECRET",
    "OPENAI_API_KEY",
    "S3_BUCKET",
    "STRIPE_ENTERPRISE_PRICE_ID",
    "STRIPE_GROWTH_PRICE_ID",
    "STRIPE_PUBLISHABLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_STARTER_PRICE_ID",
    "STRIPE_WEBHOOK_SECRET",
    "SUPABASE_JWT_SECRET",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SERVICE_KEY",
    "SUPABASE_URL",
    "SUPABASE_WEB_LOGIN",
    "VITE_PROFIT_AI_URL",
    "VITE_SUPABASE_ANON_KEY",
    "VITE_SUPABASE_URL",
    "VITE_SUPPLIER_OPTIMIZER_URL"
  ];

  console.log(`📋 Copierea ${secrets.length} secrets din ${sourceRepo} către ${targetOrg}`);
  
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < secrets.length; i++) {
    const secretName = secrets[i];
    console.log(`\n[${i + 1}/${secrets.length}] 🔄 Copierea: ${secretName}`);
    
    try {
      // Citește valoarea din repository-ul sursă
      const secretValue = execSync(`gh secret get ${secretName} --repo ${sourceRepo}`, { 
        encoding: "utf-8"
      }).trim();

      // Setează în organizația PayAiX
      execSync(`gh secret set ${secretName} --org ${targetOrg} --body "${secretValue}"`, { 
        encoding: "utf-8"
      });
      
      console.log(`✅ ${secretName} copiat cu succes`);
      successCount++;
      
    } catch (err) {
      console.log(`❌ ${secretName} - eroare: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n🎉 Finalizat! ${successCount} copiate, ${errorCount} erori`);

} catch (err) {
  console.error("❌ Eroare:", err.message);
}
