import * as fs from 'fs';
import {LOG, DEBUG, ERROR} from './../log/log';
import {command} from './../cmd/cmd';
import path from 'path';

const hasFail = (error: string, errorMsg: string) => {
  if (error) {
    LOG(ERROR, `${errorMsg} ${error}`);
    return true;
  }
  return false;
};
export const getFolder = (file: string): string => {
  if (!file) {
    LOG(DEBUG, `path ${file} not exists`);
  }
  const parts = file.split('/');
  const filename = parts[parts.length -1];
  const replaceable = filename.indexOf('.') !== -1 ? filename: '';
  const folder = file.replace(replaceable, '');
  return folder;
};
export const getFirstFolder = (file: string) => {
  if (!file) {
    LOG(DEBUG, `path ${file} not exists`);
  }
  const parts = file.split('/');
  const filename = parts[parts.length - 1];
  const replaceable = filename.indexOf('.') !== -1 ? filename : '';
  const folder = file.replace(replaceable, '');
  const folderParts = folder.split('/').filter((name) => name !== '');
  return folderParts[0];
};
export const createFolder = (folder: string) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, {recursive: true});
    LOG(DEBUG, `folder ${folder} created`);
  }
}
// TODO: min node.js 14.14
export const removeFolder = (folder: string, doLog = false) => {
  if (fs.existsSync(folder)) {
    fs.rmSync(folder, {recursive: true, force: true});
    doLog && LOG(DEBUG, `folder ${folder} removed`);
  }
};
export const removeFile = (filePath: string, doLog = false) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    doLog && LOG(DEBUG, `file ${filePath} removed`);
  }
};
export const moveFolder = (oldFolder: string, newFolder: string) => {
  // console.log(fileExists(oldFolder));
  if (!fileExists(newFolder)) {
    createFolder(newFolder);
  }
  fs.renameSync(oldFolder, newFolder);
};
export const writeFileSync = (path: string, rawData: string, option = 'replace', createDirectory = false) => {
  const folder = getFolder(path);

  const data: string = (typeof rawData === 'string' ? rawData : JSON.stringify(rawData, null, 4) || '');
  // LOG(DEBUG, command('pwd'));
  const options = (option === 'attach') ? {flag: 'a+'} : {};
  if (createDirectory) {
    createFolder(folder);
  }
  fs.writeFileSync( path, data, options );
};

export const fileExists = (path: string) => {
  return fs.existsSync(path);
}
export const readFile = (path: string, createIfNotExits = false, options: any = {}, customError: string = ``) => {
  if (!options) {
    options = {};
  }
  options['encoding'] = 'utf8';
  try {
    // , { flag: 'wx' }
    // let exists = fs.existsSync(path);
    return fs.readFileSync(path, options).toString();
  } catch (error: any) {
    hasFail(error, customError);
  }
};
export const getFileList = (path: string) => {
  const files: Array<string> = [];
  fs.readdirSync(path).forEach(file => {
    files.push(file);
  });
  return files;
}

export function readFilesRecursively(dir: string, fileList: any[] = []): any[] {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
          readFilesRecursively(filePath, fileList);
          fileList.push({ path: filePath, type: 'folder'});
      } else {
          fileList.push({ path: filePath, type: 'file'});
      }
  });

  return fileList;
}