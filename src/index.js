#!/usr/bin/env node

import prompts from 'prompts'
import path from 'path'
import fetch from 'node-fetch'
import createFabricMod from './create-fabric-mod.js'

const mc_versions = await fetch('https://meta.fabricmc.net/v2/versions/game').then(res => res.json()).then(arr => arr.map(element => element.version))

const questions = [
  {
    type: 'text',
    name: 'modid',
    message: "What is your project's modid?",
    initial: 'my-mod',
    validate: (name) => {
      const validation = validateModId(name)
      if (validation) {
        return true
      }
      return 'Invalid project name: non [a-z0-9_.-] character found'
    }
  },
  {
    type: 'text',
    name: 'maven_group',
    message: "What is your project's maven group?",
    initial: 'com.example.modid',
    validate: (name) => {
      const validation = validateJavaId(name)
      if (validation) {
        return true
      }
      return 'Invalid maven group: non [a-z0-9_.] character found'
    }
  },
  {
    type: 'text',
    name: 'mc_version',
    message: "What is your project's Minecraft version?",
    initial: mc_versions[0],
    validate: (name) => {
      return mc_versions.includes(name) || 'Invalid Minecraft version'
    }
  },
  {
    type: 'text',
    name: 'modloader',
    message: "What is your project's modloader?",
    initial: 'quilt',
    validate: (name) => {
      //TODO: validate that the modloader exists for that version?
      return true
    }
  },
  {
    type: 'text',
    name: 'author',
    message: "What is your name?",
    initial: 'Will BL'
    //TODO: auto set based on user name?
  },
  {
    type: 'text',
    name: 'license',
    message: "What license will this project be under?",
    initial: 'MIT'
    //TODO: autocomplete with a biiig license list
  },
  {
    type: 'text',
    name: 'description',
    message: "Please describe your project:",
    initial: 'This mod adds things.'
  },
  {
    type: 'toggle',
    name: 'git',
    message: "Should I initialise a git repo?",
    active: 'yes',
    inactive: 'no',
    initial: 'active'
  },
  {
    type: 'toggle',
    name: 'kotlin',
    message: "Should I set this mod up with Kotlin?",
    active: 'yes',
    inactive: 'no'
  }
]

async function run() {
  const responses = await prompts(questions)
  await createFabricMod(responses, mc_versions)
}

function validateModId(input) {
  return input.replaceAll(/[a-z0-9_.-]/g, '').length == 0
}

function validateJavaId(input) {
  return input.replaceAll(/[a-z0-9_.]/g, '').length == 0 //TODO: don't allow malformed package names
}

run()
