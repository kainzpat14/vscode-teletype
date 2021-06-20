import { ICollaborationTreeElement } from "./iCollaborationTreeElement";
import * as vscode from 'vscode';
import * as path from 'path';
import PortalBinding from "../../PortalBinding";

export class PeerTreeElement extends vscode.TreeItem implements ICollaborationTreeElement {
    constructor(public connection : PortalBinding, public peer : string) {
        super(peer, connection.getFiles(peer).length === 0?vscode.TreeItemCollapsibleState.None:vscode.TreeItemCollapsibleState.Expanded);
        this.resourceUri=vscode.Uri.parse("collab-peer://"+peer);
    }

    iconPath = {
        light: path.join(__filename, '..','..','..','..',   'resources', 'light', 'peer.svg'),
        dark: path.join(__filename, '..','..','..','..',  'resources', 'dark', 'peer.svg')
    };

    contextValue = "peer";
}