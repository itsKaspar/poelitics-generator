#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CHOICES = fs.readdirSync(join(__dirname, 'templates'));

const QUESTIONS = [
  {
    name: 'project-choice',
    type: 'list',
    message: 'What project template would you like to generate?',
    choices: CHOICES,
  },
  {
    name: 'project-name',
    type: 'input',
    message: 'Project name:',
  },
  {
    name: 'project-description',
    type: 'input',
    message: 'Project description:',
  }
];

const CURR_DIR = process.cwd();

inquirer.prompt(QUESTIONS).then((answers) => {
  const projectChoice = answers['project-choice'];
  const projectName = answers['project-name'];
  const projectSlug = answers['project-name'].toLowerCase().replace(/\s+/g, '-');
  const projectDescription = answers['project-description'];
  const templatePath = join(__dirname, 'templates', projectChoice);

  fs.mkdirSync(join(CURR_DIR, projectSlug));

  // Pass additional data as parameters
  createDirectoryContents(templatePath, projectSlug, { projectSlug, projectName, projectDescription });
});

function createDirectoryContents(templatePath, newProjectPath, data) {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach(file => {
    const origFilePath = join(templatePath, file);
    const stats = fs.statSync(origFilePath);

    if (stats.isFile()) {
      const writePath = join(CURR_DIR, newProjectPath, file);
      
      if (isTextFile(file)) {
        // Only read and modify known text files
        let contents = fs.readFileSync(origFilePath, 'utf8');
        // Perform placeholder replacements for text files
        contents = contents.replace(/{{PROJECT_SLUG}}/g, data.projectSlug)
                           .replace(/{{PROJECT_NAME}}/g, data.projectName)
                           .replace(/{{PROJECT_DESCRIPTION}}/g, data.projectDescription);
        fs.writeFileSync(writePath, contents, 'utf8');
      } else {
        // Treat all other files as binary and copy directly
        fs.copyFileSync(origFilePath, writePath);
      }
    } else if (stats.isDirectory()) {
      fs.mkdirSync(join(CURR_DIR, newProjectPath, file));
      createDirectoryContents(join(templatePath, file), join(newProjectPath, file), data);
    }
  });
}


function isTextFile(fileName) {
  // Define the extensions of files you want to edit
  const textExtensions = ['.html', '.js', '.css', '.json', '.php', '.md'];
  return textExtensions.some(ext => fileName.endsWith(ext));
}