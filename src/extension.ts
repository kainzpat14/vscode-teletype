'use strict';

import * as vscode from 'vscode';
import { CollaborationTreeDataProvider } from './view/tree/collaborationTreeDataProvider';
import { TeletypeConnector } from './view/connector/teletypeConnector';
import { YJSConnector } from './view/connector/yjsConnector';
import { MultiConnector } from './view/connector/multiConnector';
import { PeerFileDecorationProvider } from './view/tree/peerFileDecorationProvider';
import { ExtensionContext } from './extensionContext';
import { IEditorSync } from './sync/iEditorSync';
import { SharingFileDecorationProvider } from './view/sharing/sharingFileDecorationProvider';
import { FileSharer } from './view/sharing/fileSharer';
import { SyncConnection } from './binding/syncConnection';
import { ConnectionTreeElement } from './view/tree/connectionTreeElement';
import envPaths from "env-paths";
import { CodeServerConnector } from './view/connector/codeServerConnector';


let extensionContext = ExtensionContext.default();
let shareProvider = new SharingFileDecorationProvider(extensionContext.connectionManager);
let fileSharer = new FileSharer(extensionContext.connectionManager, shareProvider);

// this method is called when the extension is activated
// the extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	extensionContext.extensionKind = context.extension.extensionKind;
	determineCodeServer(context);
	
	let extensionMode = context.extension.extensionKind === vscode.ExtensionKind.UI ? "UI" : "Backend";
	console.log("Starting the collaboration extension in mode "+extensionMode+ " CodeServer="+extensionContext.isCodeServer);
	
	context.subscriptions.push(vscode.workspace.registerFileSystemProvider("collabfs",extensionContext.collabFs, {isCaseSensitive: true}));

	vscode.window.registerFileDecorationProvider(new PeerFileDecorationProvider(extensionContext.colorManager));
	vscode.window.registerFileDecorationProvider(shareProvider);

	let teletypeConnector = new TeletypeConnector(context.workspaceState, extensionContext);
	let yjsConnector = new YJSConnector(context.workspaceState, extensionContext);
	let codeServerConnector = new CodeServerConnector(extensionContext);
	let multiConnector = new MultiConnector(extensionContext, [yjsConnector, teletypeConnector,codeServerConnector]);

	vscode.window.registerTreeDataProvider("extension.collaboration", new CollaborationTreeDataProvider(extensionContext.connectionManager));

	createCommands(multiConnector);

	multiConnector.restoreConnections();
}


function determineCodeServer(context: vscode.ExtensionContext) {
	if (context.extension.extensionKind === vscode.ExtensionKind.UI) {
		if (typeof window !== 'undefined') {
			extensionContext.isCodeServer = true;
		}
	} else {
		let probableCodeServerPath = envPaths("code-server",  { suffix: "" }).data;
		extensionContext.isCodeServer = context.extensionPath.startsWith(probableCodeServerPath);
	}
}

function createCommands(multiConnector: MultiConnector) {
	vscode.commands.registerCommand("extension.addCollabConnection", async () => {
		try {
			await multiConnector.newConnection();
		} catch (error) {
			await vscode.window.showErrorMessage(error.message);
		}
	});

	vscode.commands.registerCommand("extension.removeCollabConnection", async (element: ConnectionTreeElement) => {
		try {
			extensionContext.connectionManager.remove(element.connection);
		} catch (error) {
			await vscode.window.showErrorMessage(error.message);
		}
	});

	vscode.commands.registerCommand("extension.openCollabFile", (syncConnection: SyncConnection, editorSync: IEditorSync) => {
		syncConnection.shareRemoteToLocal.activateRemoteFile(editorSync);
	});

	vscode.commands.registerCommand("extension.shareItem", async (uri: vscode.Uri) => {
		try {
			await fileSharer.shareFile(uri);
		} catch (error) {
			await vscode.window.showErrorMessage(error.message);
		}
	});

	vscode.commands.registerCommand("extension.unshareItem", async (uri: vscode.Uri) => {
		try {
			await fileSharer.unshareFile(uri);
		} catch (error) {
			await vscode.window.showErrorMessage(error.message);
		}
	});
}

export function deactivate() { 
	extensionContext.connectionManager.dispose();
}
