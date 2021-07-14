import fetch from 'node-fetch'
import unzip from 'unzip'
import path from 'path'
import fs from 'fs'
import fsp from 'fs/promises'
import tmp from 'tmp'
import mvdir from 'mvdir'
import es from 'event-stream'
import recursiveReadDir from 'recursive-readdir'

export default async function createFabricMod(
  responses,
  mc_versions
) {

  const branch = doesUseJava16(responses.mc_version, mc_versions) ? '1.17' : 'master'
  const templateUrl = `https://github.com/FabricMC/fabric-example-mod/archive/refs/heads/${branch}.zip`


  const tmpDir = tmp.dirSync({ prefix: 'c-mc-m-' })
  const sdkDir = path.resolve(tmpDir.name, `fabric-example-mod-${branch}`)

  await fetch(templateUrl)
    .then(res => {
      const extract = unzip.Extract({path: path.resolve(tmpDir.name)})
      res.body.pipe(extract)
      return new Promise((resolve, reject) => {
        extract.on('close', () => resolve())
      })
    })
  await mvdir(path.resolve(sdkDir, 'src/main/resources/modid.mixins.json'), path.resolve(sdkDir, `src/main/resources/${responses.modid}.mixins.json`))
  await mvdir(path.resolve(sdkDir, 'src/main/resources/assets/modid'), path.resolve(sdkDir, `src/main/resources/${responses.modid}`))
  await mvdir(path.resolve(sdkDir, 'src/main/java/net/fabricmc/example'), path.resolve(sdkDir, `src/main/java/${responses.maven_group.replace('.', '/')}`))

  await replaceRecursively(sdkDir, 'com.example', responses.maven_group)
  await replaceRecursively(sdkDir, 'fabric-example-mod', responses.modid)
  await replaceRecursively(sdkDir, 'modid', responses.modid)

  await updateModJson(path.resolve(sdkDir, 'src/main/resources/fabric.mod.json'), responses, mc_versions)

  console.log(sdkDir)
  console.log(path.resolve(responses.modid))
  await mvdir(sdkDir, path.resolve(responses.modid))
}

async function replaceRecursively(path, find, replace) {
  const files = await recursiveReadDir(path)

  return Promise.all(files.map(file => replaceInFile(file, find, replace)))
}

// https://stackoverflow.com/a/34498610/5507477
async function replaceInFile(path, find, replace) {
  const writeStream = fs.createWriteStream(path)
  fs.createReadStream(path, 'utf8')
    .pipe(es.split())
    .pipe(es.map((line, next) => next(null, line.replace(find, replace))))
    .pipe(writeStream);
  return new Promise((resolve, reject) => {
    writeStream.on('close', () => resolve())
  })
}

async function updateModJson(path, data, mc_versions) {
  await fsp.writeFile(path,
    JSON.stringify({
      schemaVersion: 1,
      id: data.modid,
      version: "${version}",
      name: data.name,
      description: data.description,
      authors: [ data.author ],
      contact: {
        homepage: data.homepage,
        sources: data.source
      },
      license: data.license,
      icon: `assets/${data.modid}/icon.png`,
      environment: "*",
      entrypoints: {
        main: [
          data.maven_group+"ExampleMod"
        ]
      },
      mixins: [
        data.modid+".mixins.json"
      ],
      depends: {
        fabricloader: ">=0.11.3",
        fabric: "*",
        minecraft: `>=${data.mc_version}`,
        java: doesUseJava16(data.mc_version, mc_versions) ? ">=16" : ">=8"
      }
    }))
}

function doesUseJava16(version, mc_versions) {
  return mc_versions.indexOf(version) <= mc_versions.indexOf('21w19a')
}

