import { ICollaborationTreeElement } from "./iCollaborationTreeElement";
import * as vscode from 'vscode';
import * as path from 'path';
import BufferBinding from "../../BufferBinding";
import PortalBinding from "../../PortalBinding";
import { IEditorSync } from "../../sync/iEditorSync";

export class FileTreeElement extends vscode.TreeItem implements ICollaborationTreeElement {
    constructor(public portalBinding : PortalBinding, public editorSync : IEditorSync, public binding : BufferBinding) {
        super(binding.fileName);
        this.command = {
            command: "extension.openCollabFile", 
            arguments: [
                portalBinding, 
                editorSync
            ], 
            title: "Open Remote File "+binding.fileName
        };
    }

    iconPath = {
        light: path.join(__filename, '..','..','..','..',   'resources', 'light', 'file.svg'),
        dark: path.join(__filename, '..','..','..','..',  'resources', 'dark', 'file.svg')
    };

    contextValue = "file";
}