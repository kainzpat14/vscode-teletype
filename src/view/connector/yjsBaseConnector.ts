import { WebsocketProvider } from "y-websocket";
import { BaseConnector } from "./baseConnector";
import * as Y from 'yjs';
import * as vscode from 'vscode';
import { YSyncPortal } from "../../sync/yjs/ySyncPortal";

export abstract class YjsBaseConnector extends BaseConnector {
    protected async connect(yjsUrl: string, yjsRoom: string, name : string = yjsUrl + ":" + yjsRoom) {
        let doc = new Y.Doc();
        const wsProvider = new WebsocketProvider(yjsUrl, yjsRoom, doc, { WebSocketPolyfill: require('ws') });
        let promise = new Promise<void>((resolve,reject) => {
            wsProvider.on('status', (event: any) => {
                let status = event.status;
                if (status === "connected") {
                    console.debug('Connected to YJS URL ' + yjsUrl + ' and room ' + yjsRoom);
                    vscode.window.showInformationMessage('Connected to YJS URL ' + yjsUrl + ' and room ' + yjsRoom);
                    resolve();
                } else {
                    vscode.window.showInformationMessage('Connection YJS URL ' + yjsUrl + ' and room ' + yjsRoom + " (status= " + status+")");
                }
            });
        });
        await promise;
        return this.addConnection(name, new YSyncPortal(doc));
    }
}