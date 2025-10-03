import { execSync } from "child_process";
import fs from "fs";

console.log("🔐 Copying secrets from JSON to PayAiX organization...");

try {
  // Verifică dacă GitHub CLI este instalat
  try {
    execSync("gh --version", { encoding: "utf-8" });
  } catch (err) {
    console.error("❌ GitHub CLI (gh) nu este instalat. Instalează-l cu: brew install gh");
    process.exit(1);
  }

  // Verifică dacă utilizatorul este autentificat
  try {
    execSync("gh auth status", { encoding: "utf-8" });
  } catch (err) {
    console.error("❌ Nu ești autentificat cu GitHub CLI. Rulează: gh auth login");
    process.exit(1);
  }

  // Citește fișierul secrets.json
  if (!fs.existsSync("secrets.json")) {
    console.error("❌ Fișierul secrets.json nu există. Rulează mai întâi: node scripts/export-secrets.js");
    process.exit(1);
  }

  const secretsData = JSON.parse(fs.readFileSync("secrets.json", "utf-8"));
  const secrets = secretsData.secrets;

  console.log(`📋 Găsite ${secrets.length} secrets în secrets.json`);
  console.log(`📅 Data export: ${secretsData.exportDate}`);
  console.log(`📦 Repository sursă: ${secretsData.repository}`);

  // Verifică dacă organizația PayAiX există
  console.log("\n🔍 Verificând organizația PayAiX...");
  try {
    const orgCheck = execSync("gh org list", { encoding: "utf-8" });
    if (!orgCheck.includes("PayAiX")) {
      console.log("⚠️  Organizația 'PayAiX' nu a fost găsită în lista de organizații.");
      console.log("💡 Creează organizația pe GitHub sau verifică numele.");
    } else {
      console.log("✅ Organizația 'PayAiX' a fost găsită.");
    }
  } catch (err) {
    console.log("⚠️  Nu s-a putut verifica organizația. Continuăm...");
  }

  // Generează comenzile pentru copierea valorilor
  console.log("\n" + "=".repeat(60));
  console.log("📋 COMENZI PENTRU COPIEREA VALORILOR SECRETS:");
  console.log("=".repeat(60));
  console.log("# Pentru fiecare secret, rulează comanda cu valoarea reală:");
  console.log("");

  secrets.forEach((secretName, index) => {
    console.log(`# ${index + 1}. ${secretName}`);
    console.log(`gh secret set ${secretName} --org PayAiX --body "VALOAREA_REALA_AICI"`);
    console.log("");
  });

  // Generează script pentru copierea automată (cu prompt pentru valori)
  console.log("🤖 SCRIPT PENTRU COPIEREA AUTOMATĂ:");
  console.log("=".repeat(40));
  console.log("#!/bin/bash");
  console.log("# Script pentru copierea automată a secrets");
  console.log("# Rulează: bash copy-secrets.sh");
  console.log("");

  const bashScript = `#!/bin/bash

echo "🔐 Copying secrets to PayAiX organization..."
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
        gh secret set "\$secret" --org PayAiX --body "\$secret_value"
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
echo "🔍 Verify with: gh secret list --org PayAiX"
`;

  fs.writeFileSync("copy-secrets.sh", bashScript);
  console.log(bashScript);

  // Generează și un script PowerShell pentru Windows
  const powershellScript = `# PowerShell script pentru copierea secrets
Write-Host "🔐 Copying secrets to PayAiX organization..." -ForegroundColor Green
Write-Host "⚠️  You will be prompted for each secret value." -ForegroundColor Yellow
Write-Host ""

# Array cu numele secretelor
$secrets = @(${secrets.map(s => `"${s}"`).join(', ')})

foreach ($secret in $secrets) {
    Write-Host "📝 Enter value for: $secret" -ForegroundColor Cyan
    $secretValue = Read-Host "Value" -AsSecureString
    $plainSecretValue = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretValue))
    
    if ($plainSecretValue) {
        Write-Host "🔄 Setting $secret..." -ForegroundColor Yellow
        $result = gh secret set $secret --org PayAiX --body $plainSecretValue
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $secret set successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to set $secret" -ForegroundColor Red
        }
    } else {
        Write-Host "⏭️  Skipping $secret (empty value)" -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "🎉 Secrets copy completed!" -ForegroundColor Green
Write-Host "🔍 Verify with: gh secret list --org PayAiX" -ForegroundColor Cyan
`;

  fs.writeFileSync("copy-secrets.ps1", powershellScript);

  // Salvează și un fișier cu instrucțiuni
  const instructions = `# 📋 INSTRUCȚIUNI PENTRU COPIEREA SECRETS ÎN PAYAIX

## Opțiunea 1: Copiere Manuală
Pentru fiecare secret din lista de mai sus, rulează:
\`\`\`bash
gh secret set SECRET_NAME --org PayAiX --body "VALOAREA_REALA"
\`\`\`

## Opțiunea 2: Script Bash (macOS/Linux)
\`\`\`bash
chmod +x copy-secrets.sh
./copy-secrets.sh
\`\`\`

## Opțiunea 3: Script PowerShell (Windows)
\`\`\`powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
./copy-secrets.ps1
\`\`\`

## Verificare
După copiere, verifică cu:
\`\`\`bash
gh secret list --org PayAiX
\`\`\`

## Secrets de copiat (${secrets.length} total):
${secrets.map((s, i) => `${i + 1}. ${s}`).join('\n')}
`;

  fs.writeFileSync("SECRETS_COPY_INSTRUCTIONS.md", instructions);

  console.log("\n💾 Fișiere generate:");
  console.log("📄 copy-secrets.sh - Script Bash pentru macOS/Linux");
  console.log("📄 copy-secrets.ps1 - Script PowerShell pentru Windows");
  console.log("📄 SECRETS_COPY_INSTRUCTIONS.md - Instrucțiuni detaliate");

  console.log("\n🎯 Următorii pași:");
  console.log("1. Alege o metodă de copiere (manuală sau script)");
  console.log("2. Rulează comenzile pentru fiecare secret");
  console.log("3. Verifică cu: gh secret list --org PayAiX");
  console.log("4. Testează deployment-ul pe un repository");

} catch (err) {
  console.error("❌ Eroare la procesarea secrets:", err.message);
  
  if (err.message.includes("ENOENT")) {
    console.log("\n💡 Posibile soluții:");
    console.log("- Verifică că fișierul secrets.json există");
    console.log("- Rulează mai întâi: node scripts/export-secrets.js");
  }
}
