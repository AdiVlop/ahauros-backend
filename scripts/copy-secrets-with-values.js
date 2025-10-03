import { execSync } from "child_process";
import fs from "fs";

console.log("🔐 Copying secrets with real values to PayAiX organization...");

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
  const sourceRepo = secretsData.repository;

  console.log(`📋 Găsite ${secrets.length} secrets în secrets.json`);
  console.log(`📦 Repository sursă: ${sourceRepo}`);

  // Verifică dacă organizația PayAiX există
  console.log("\n🔍 Verificând organizația PayAiX...");
  try {
    const orgCheck = execSync("gh org list", { encoding: "utf-8" });
    if (!orgCheck.includes("PayAiX")) {
      console.log("⚠️  Organizația 'PayAiX' nu a fost găsită în lista de organizații.");
      console.log("💡 Creează organizația pe GitHub sau verifică numele.");
      process.exit(1);
    } else {
      console.log("✅ Organizația 'PayAiX' a fost găsită.");
    }
  } catch (err) {
    console.log("⚠️  Nu s-a putut verifica organizația. Continuăm...");
  }

  console.log("\n🔄 Copierea valorilor reale din repository-ul sursă...");
  console.log("⚠️  Această operație va copia valorile reale ale secretelor!");

  let successCount = 0;
  let errorCount = 0;
  const results = [];

  for (let i = 0; i < secrets.length; i++) {
    const secretName = secrets[i];
    console.log(`\n📝 [${i + 1}/${secrets.length}] Copierea: ${secretName}`);
    
    try {
      // Citește valoarea secretului din repository-ul sursă
      const secretValue = execSync(`gh secret get ${secretName} --repo ${sourceRepo}`, { 
        encoding: "utf-8",
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim();

      if (secretValue) {
        // Setează secretul în organizația PayAiX
        execSync(`gh secret set ${secretName} --org PayAiX --body "${secretValue}"`, { 
          encoding: "utf-8",
          stdio: ['pipe', 'pipe', 'pipe']
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

  // Salvează rezultatele
  const reportData = {
    timestamp: new Date().toISOString(),
    sourceRepo: sourceRepo,
    targetOrg: "PayAiX",
    totalSecrets: secrets.length,
    successCount: successCount,
    errorCount: errorCount,
    results: results
  };

  fs.writeFileSync("secrets-copy-report.json", JSON.stringify(reportData, null, 2));
  console.log("\n💾 Raportul a fost salvat în: secrets-copy-report.json");

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
  
  if (err.message.includes("ENOENT")) {
    console.log("\n💡 Posibile soluții:");
    console.log("- Verifică că fișierul secrets.json există");
    console.log("- Rulează mai întâi: node scripts/export-secrets.js");
  }
}
