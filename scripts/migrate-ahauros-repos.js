import { execSync } from "child_process";

console.log("🔍 Scanning for Ahauros repositories...");

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

  console.log("📋 Listând toate repository-urile...");
  
  // 1. Listează toate repo-urile userului
  const reposOutput = execSync("gh repo list --json name,owner,description,isPrivate --limit 200", { encoding: "utf-8" });
  const repos = JSON.parse(reposOutput);

  console.log(`📊 Total repository-uri găsite: ${repos.length}`);

  // 2. Filtrează doar cele care conțin "ahauros"
  const ahaurosRepos = repos.filter(r => 
    r.name.toLowerCase().includes("ahauros") || 
    (r.description && r.description.toLowerCase().includes("ahauros"))
  );

  if (ahaurosRepos.length === 0) {
    console.log("⚠️  Nu s-au găsit repository-uri cu numele 'ahauros'.");
    console.log("\n💡 Verifică dacă:");
    console.log("- Repository-urile au numele corect");
    console.log("- Sunt în account-ul tău personal");
    console.log("- Ai acces la ele");
    process.exit(0);
  }

  console.log(`\n✅ Repo-uri detectate cu numele 'ahauros' (${ahaurosRepos.length}):`);
  console.log("=" * 60);
  
  ahaurosRepos.forEach((r, index) => {
    const visibility = r.isPrivate ? "🔒 Private" : "🌐 Public";
    const description = r.description ? ` - ${r.description}` : "";
    console.log(`${index + 1}. ${r.owner.login}/${r.name} ${visibility}${description}`);
  });

  // 3. Pregătește comenzile pentru transfer
  console.log("\n" + "=" * 60);
  console.log("👉 COMENZI PENTRU TRANSFER ÎN ORGANIZAȚIA AHAUROS:");
  console.log("=" * 60);
  
  ahaurosRepos.forEach((r, index) => {
    console.log(`# ${index + 1}. Transfer ${r.name}`);
    console.log(`gh repo transfer ${r.owner.login}/${r.name} --organization Ahauros`);
    console.log("");
  });

  // 4. Comenzi alternative pentru verificare
  console.log("🔍 COMENZI PENTRU VERIFICARE:");
  console.log("=" * 30);
  console.log("# Verifică organizația Ahauros");
  console.log("gh org list");
  console.log("");
  console.log("# Verifică repo-urile din organizație");
  console.log("gh repo list --org Ahauros");
  console.log("");
  console.log("# Verifică un repo specific după transfer");
  console.log("gh repo view Ahauros/ahauros-backend");

  // 5. Instrucțiuni suplimentare
  console.log("\n📝 INSTRUCȚIUNI PENTRU TRANSFER:");
  console.log("=" * 40);
  console.log("1. Asigură-te că organizația 'Ahauros' există");
  console.log("2. Rulează comenzile de transfer unul câte unul");
  console.log("3. Confirmă transferul când ești întrebat");
  console.log("4. Verifică că repo-urile apar în organizație");
  console.log("5. Actualizează URL-urile în proiecte dacă e necesar");

  // 6. Salvează rezultatele în fișier
  const migrationData = {
    scanDate: new Date().toISOString(),
    totalRepos: repos.length,
    ahaurosRepos: ahaurosRepos.length,
    repositories: ahaurosRepos.map(r => ({
      name: r.name,
      owner: r.owner.login,
      fullName: `${r.owner.login}/${r.name}`,
      isPrivate: r.isPrivate,
      description: r.description,
      transferCommand: `gh repo transfer ${r.owner.login}/${r.name} --organization Ahauros`
    }))
  };

  const fs = await import('fs');
  fs.writeFileSync("ahauros-repos-migration.json", JSON.stringify(migrationData, null, 2));
  
  console.log("\n💾 Rezultatele au fost salvate în: ahauros-repos-migration.json");

} catch (err) {
  console.error("❌ Eroare la listare repo-uri:", err.message);
  
  if (err.message.includes("not found")) {
    console.log("\n💡 Posibile soluții:");
    console.log("- Verifică dacă ai acces la repository-uri");
    console.log("- Verifică dacă GitHub CLI este configurat corect");
    console.log("- Încearcă să rulezi: gh auth refresh");
  }
}
