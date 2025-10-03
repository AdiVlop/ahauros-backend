import { execSync } from "child_process";
import fs from "fs";

const repo = "AdiVlop/ahauros-dashboard"; // schimbă cu numele tău de repo

console.log(`🔍 Exporting secrets from repository: ${repo}`);

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

  console.log("📋 Listând secrets din repository...");
  
  const output = execSync(`gh secret list --repo ${repo}`, { encoding: "utf-8" });
  const lines = output.split("\n").filter(Boolean);
  
  const secrets = lines.map(line => {
    const [name] = line.split(/\s+/);
    return name;
  });

  if (secrets.length === 0) {
    console.log("⚠️  Nu s-au găsit secrets în repository.");
    process.exit(0);
  }

  // Creează obiectul cu secrets
  const secretsData = {
    repository: repo,
    exportDate: new Date().toISOString(),
    secrets: secrets,
    count: secrets.length
  };

  // Scrie în fișier JSON
  fs.writeFileSync("secrets.json", JSON.stringify(secretsData, null, 2));
  
  console.log("✅ Secrets exportate în secrets.json:");
  console.log(`📊 Total secrets: ${secrets.length}`);
  secrets.forEach((secret, index) => {
    console.log(`   ${index + 1}. ${secret}`);
  });
  
  console.log("\n📝 Următorii pași:");
  console.log("1. Intră în GitHub → Organization → Settings → Secrets and variables → Actions");
  console.log("2. Creează secrets unul câte unul folosind lista de mai sus");
  console.log("3. Copiază valorile din repo-ul ahauros-dashboard");
  console.log("4. După migrare, toate repo-urile Ahauros le vor putea folosi");

} catch (err) {
  console.error("❌ Eroare la export:", err.message);
  
  if (err.message.includes("not found")) {
    console.log("\n💡 Posibile soluții:");
    console.log("- Verifică numele repository-ului");
    console.log("- Asigură-te că ai acces la repository");
    console.log("- Verifică dacă repository-ul există");
  }
}
