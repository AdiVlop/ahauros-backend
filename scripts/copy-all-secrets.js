import { execSync } from "child_process";

console.log("🔐 Auto-copying ALL secrets from ahauros-dashboard to PayAiX organization...");

try {
  const sourceRepo = "AdiVlop/ahauros-dashboard";
  const targetOrg = "PayAiX";
  
  // Lista completă de secrets
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
  console.log("⚠️  Această operație va copia valorile reale ale secretelor!");
  
  let successCount = 0;
  let errorCount = 0;
  const results = [];

  for (let i = 0; i < secrets.length; i++) {
    const secretName = secrets[i];
    console.log(`\n[${i + 1}/${secrets.length}] 🔄 Copierea: ${secretName}`);
    
    try {
      // Citește valoarea din repository-ul sursă
      const secretValue = execSync(`gh secret get ${secretName} --repo ${sourceRepo}`, { 
        encoding: "utf-8"
      }).trim();

      if (secretValue && secretValue.length > 0) {
        // Setează în organizația PayAiX
        execSync(`gh secret set ${secretName} --org ${targetOrg} --body "${secretValue}"`, { 
          encoding: "utf-8"
        });
        
        console.log(`✅ ${secretName} copiat cu succes`);
        successCount++;
        results.push({ name: secretName, status: "success" });
      } else {
        console.log(`⚠️  ${secretName} - valoare goală, sărit`);
        results.push({ name: secretName, status: "empty" });
      }
      
    } catch (err) {
      console.log(`❌ ${secretName} - eroare: ${err.message}`);
      errorCount++;
      results.push({ name: secretName, status: "error", error: err.message });
    }
  }

  // Rezumat final
  console.log("\n" + "=".repeat(60));
  console.log("📊 REZUMAT FINAL:");
  console.log("=".repeat(60));
  console.log(`✅ Copiate cu succes: ${successCount}`);
  console.log(`❌ Erori: ${errorCount}`);
  console.log(`📋 Total procesate: ${secrets.length}`);

  // Verificare finală
  console.log("\n🔍 Verificare finală...");
  try {
    const finalCheck = execSync("gh secret list --org PayAiX", { encoding: "utf-8" });
    const lines = finalCheck.split('\n').filter(line => line.trim());
    console.log(`📋 Secrets în PayAiX: ${lines.length - 1} (excluzând header-ul)`);
  } catch (err) {
    console.log("⚠️  Nu s-a putut verifica lista finală de secrets");
  }

  if (successCount > 0) {
    console.log("\n🎉 Migrarea secrets a fost completată cu succes!");
    console.log("🔗 Toate repository-urile din organizația PayAiX pot folosi aceste secrets.");
  }

} catch (err) {
  console.error("❌ Eroare la procesarea secrets:", err.message);
}
