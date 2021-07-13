export default async function createFabricMod(
  responses,
  mc_versions
) {
  const templateUrl = `https://github.com/FabricMC/fabric-example-mod/archive/refs/heads/${mc_versions.indexOf(responses.mc_version) <= mc_versions.indexOf('21w19a') ? '1.17' : 'master'}.zip`

  console.log(templateUrl)
}
