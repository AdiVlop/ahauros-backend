import { execSync } from "child_process";
import fs from "fs";

console.log("🔐 Copying secrets using GitHub API to PayAiX organization...");

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

  console.log(`📋 Pregătirea ${secrets.length} secrets pentru PayAiX`);
  console.log("⚠️  GitHub CLI nu permite citirea valorilor secrets din motive de securitate.");
  console.log("💡 Trebuie să introduci manual valorile pentru fiecare secret.");
  
  let successCount = 0;
  let errorCount = 0;

  console.log("\n" + "=".repeat(60));
  console.log("📋 COMENZI PENTRU COPIEREA MANUALĂ:");
  console.log("=".repeat(60));
  console.log("# Pentru fiecare secret, rulează comanda cu valoarea reală:");
  console.log("");

  for (let i = 0; i < secrets.length; i++) {
    const secretName = secrets[i];
    console.log(`# ${i + 1}. ${secretName}`);
    console.log(`gh secret set ${secretName} --org ${targetOrg} --body "VALOAREA_REALA_AICI"`);
    console.log("");
  }

  // Generează script interactiv
  const interactiveScript = `#!/bin/bash

echo "🔐 Interactive secrets copy to PayAiX organization..."
echo "⚠️  You will be prompted for each secret value."
echo ""

# Array cu numele secretelor
secrets=(${secrets.map(s => `"${s}"`).join(' ')})

for secret in "\${secrets[@]}"; do
    echo "📝 Enter value for: \$secret"
    read -s -p "Value: " secret_value
    echo ""
    
    if [ -n "\$secret_value" ]; then
        echo "🔄 Setting \$secret..."
        gh secret set "\$secret" --org ${targetOrg} --body "\$secret_value"
        if [ \$? -eq 0 ]; then
            echo "✅ \$secret set successfully"
        else
            echo "❌ Failed to set \$secret"
        fi
    else
        echo "⏭️  Skipping \$secret (empty value)"
    fi
    echo ""
done

echo "🎉 Secrets copy completed!"
echo "🔍 Verify with: gh secret list --org ${targetOrg}"
`;

  fs.writeFileSync("interactive-copy-secrets.sh", interactiveScript);
  
  console.log("🤖 SCRIPT INTERACTIV GENERAT:");
  console.log("=".repeat(40));
  console.log("📄 interactive-copy-secrets.sh - Script pentru introducerea interactivă");
  console.log("");
  console.log("🚀 Pentru a rula scriptul interactiv:");
  console.log("chmod +x interactive-copy-secrets.sh");
  console.log("./interactive-copy-secrets.sh");
  console.log("");
  console.log("💡 Alternativ, poți rula comenzile manual una câte una.");

} catch (err) {
  console.error("❌ Eroare:", err.message);
}
