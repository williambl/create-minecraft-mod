import fetch from 'node-fetch'
import unzip from 'unzip'
import path from 'path'
import fs from 'fs'
import tmp from 'tmp'

export default async function createFabricMod(
  responses,
  mc_versions
) {
  const templateUrl = `https://github.com/FabricMC/fabric-example-mod/archive/refs/heads/${mc_versions.indexOf(responses.mc_version) <= mc_versions.indexOf('21w19a') ? '1.17' : 'master'}.zip`


  const tmpDir = tmp.dirSync({ prefix: 'c-mc-m-' })

  await fetch(templateUrl)
    .then(res => res.body.pipe(unzip.Extract({path: path.resolve(tmpDir.name)})))
}
