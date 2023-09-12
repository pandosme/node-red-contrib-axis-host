[
    {
        "id": "0f371fda47db1155",
        "type": "tab",
        "label": "Securing NodeRED",
        "disabled": false,
        "info": "",
        "env": []
    },
    {
        "id": "728e65817d3a3c8f",
        "type": "template",
        "z": "0f371fda47db1155",
        "name": "settings.js",
        "field": "payload",
        "fieldType": "msg",
        "format": "handlebars",
        "syntax": "mustache",
        "template": "/**\n * This is the default settings file provided by Node-RED.\n *\n * It can contain any valid JavaScript code that will get run when Node-RED\n * is started.\n *\n * Lines that start with // are commented out.\n * Each entry should be separated from the entries above and below by a comma ','\n *\n * For more information about individual settings, refer to the documentation:\n *    https://nodered.org/docs/user-guide/runtime/configuration\n *\n * The settings are split into the following sections:\n *  - Flow File and User Directory Settings\n *  - Security\n *  - Server Settings\n *  - Runtime Settings\n *  - Editor Settings\n *  - Node Settings\n *\n **/\n\nprocess.env.TZ = \"Europe/Stockholm\";\n\nmodule.exports = {\n\n/*******************************************************************************\n * Flow File and User Directory Settings\n *  - flowFile\n *  - credentialSecret\n *  - flowFilePretty\n *  - userDir\n *  - nodesDir\n ******************************************************************************/\n\n    /** The file containing the flows. If not set, defaults to flows_<hostname>.json **/\n    flowFile: 'flows.json',\n\n    /** By default, credentials are encrypted in storage using a generated key. To\n     * specify your own secret, set the following property.\n     * If you want to disable encryption of credentials, set this property to false.\n     * Note: once you set this property, do not change it - doing so will prevent\n     * node-red from being able to decrypt your existing credentials and they will be\n     * lost.\n     */\n    //credentialSecret: \"a-secret-key\",\n\n    /** By default, the flow JSON will be formatted over multiple lines making\n     * it easier to compare changes when using version control.\n     * To disable pretty-printing of the JSON set the following property to false.\n     */\n    flowFilePretty: true,\n\n    /** By default, all user data is stored in a directory called `.node-red` under\n     * the user's home directory. To use a different location, the following\n     * property can be used\n     */\n    //userDir: '/home/nol/.node-red/',\n\n    /** Node-RED scans the `nodes` directory in the userDir to find local node files.\n     * The following property can be used to specify an additional directory to scan.\n     */\n    //nodesDir: '/home/nol/.node-red/nodes',\n\n/*******************************************************************************\n * Security\n *  - adminAuth\n *  - https\n *  - httpsRefreshInterval\n *  - requireHttps\n *  - httpNodeAuth\n *  - httpStaticAuth\n ******************************************************************************/\n\n    /** To password protect the Node-RED editor and admin API, the following\n     * property can be used. See https://nodered.org/docs/security.html for details.\n     */\n    adminAuth: {\n        type: \"credentials\",\n        users: [{\n            username: \"admin\",\n            password: \"$2a$12$iRREj4pKvmhRwY/VMEFW5OiFa8DSLu/kDqDzzRgEnbSa0g7tRnbuG\",\n            permissions: \"*\"\n        }]\n    },\n\n    /** The following property can be used to enable HTTPS\n     * This property can be either an object, containing both a (private) key\n     * and a (public) certificate, or a function that returns such an object.\n     * See http://nodejs.org/api/https.html#https_https_createserver_options_requestlistener\n     * for details of its contents.\n     */\n\n    /** Option 1: static object */\n    //https: {\n    //  key: require(\"fs\").readFileSync('privkey.pem'),\n    //  cert: require(\"fs\").readFileSync('cert.pem')\n    //},\n\n    /** Option 2: function that returns the HTTP configuration object */\n    // https: function() {\n    //     // This function should return the options object, or a Promise\n    //     // that resolves to the options object\n    //     return {\n    //         key: require(\"fs\").readFileSync('privkey.pem'),\n    //         cert: require(\"fs\").readFileSync('cert.pem')\n    //     }\n    // },\n\n    /** If the `https` setting is a function, the following setting can be used\n     * to set how often, in hours, the function will be called. That can be used\n     * to refresh any certificates.\n     */\n    //httpsRefreshInterval : 12,\n\n    /** The following property can be used to cause insecure HTTP connections to\n     * be redirected to HTTPS.\n     */\n    //requireHttps: true,\n\n    /** To password protect the node-defined HTTP endpoints (httpNodeRoot),\n     * including node-red-dashboard, or the static content (httpStatic), the\n     * following properties can be used.\n     * The `pass` field is a bcrypt hash of the password.\n     * See https://nodered.org/docs/security.html#generating-the-password-hash\n     */\n    //httpNodeAuth: {user:\"user\",pass:\"$2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN.\"},\n    //httpStaticAuth: {user:\"user\",pass:\"$2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN.\"},\n\n/*******************************************************************************\n * Server Settings\n *  - uiPort\n *  - uiHost\n *  - apiMaxLength\n *  - httpServerOptions\n *  - httpAdminRoot\n *  - httpAdminMiddleware\n *  - httpNodeRoot\n *  - httpNodeCors\n *  - httpNodeMiddleware\n *  - httpStatic\n *  - httpStaticRoot\n ******************************************************************************/\n\n    /** the tcp port that the Node-RED web server is listening on */\n    uiPort: process.env.PORT || 1880,\n\n    /** By default, the Node-RED UI accepts connections on all IPv4 interfaces.\n     * To listen on all IPv6 addresses, set uiHost to \"::\",\n     * The following property can be used to listen on a specific interface. For\n     * example, the following would only allow connections from the local machine.\n     */\n    //uiHost: \"127.0.0.1\",\n\n    /** The maximum size of HTTP request that will be accepted by the runtime api.\n     * Default: 5mb\n     */\n    //apiMaxLength: '5mb',\n\n    /** The following property can be used to pass custom options to the Express.js\n     * server used by Node-RED. For a full list of available options, refer\n     * to http://expressjs.com/en/api.html#app.settings.table\n     */\n    //httpServerOptions: { },\n\n    /** By default, the Node-RED UI is available at http://localhost:1880/\n     * The following property can be used to specify a different root path.\n     * If set to false, this is disabled.\n     */\n    //httpAdminRoot: '/admin',\n\n    /** The following property can be used to add a custom middleware function\n     * in front of all admin http routes. For example, to set custom http\n     * headers. It can be a single function or an array of middleware functions.\n     */\n    // httpAdminMiddleware: function(req,res,next) {\n    //    // Set the X-Frame-Options header to limit where the editor\n    //    // can be embedded\n    //    //res.set('X-Frame-Options', 'sameorigin');\n    //    next();\n    // },\n\n\n    /** Some nodes, such as HTTP In, can be used to listen for incoming http requests.\n     * By default, these are served relative to '/'. The following property\n     * can be used to specify a different root path. If set to false, this is\n     * disabled.\n     */\n    //httpNodeRoot: '/red-nodes',\n\n    /** The following property can be used to configure cross-origin resource sharing\n     * in the HTTP nodes.\n     * See https://github.com/troygoode/node-cors#configuration-options for\n     * details on its contents. The following is a basic permissive set of options:\n     */\n    //httpNodeCors: {\n    //    origin: \"*\",\n    //    methods: \"GET,PUT,POST,DELETE\"\n    //},\n\n    /** If you need to set an http proxy please set an environment variable\n     * called http_proxy (or HTTP_PROXY) outside of Node-RED in the operating system.\n     * For example - http_proxy=http://myproxy.com:8080\n     * (Setting it here will have no effect)\n     * You may also specify no_proxy (or NO_PROXY) to supply a comma separated\n     * list of domains to not proxy, eg - no_proxy=.acme.co,.acme.co.uk\n     */\n\n    /** The following property can be used to add a custom middleware function\n     * in front of all http in nodes. This allows custom authentication to be\n     * applied to all http in nodes, or any other sort of common request processing.\n     * It can be a single function or an array of middleware functions.\n     */\n    //httpNodeMiddleware: function(req,res,next) {\n    //    // Handle/reject the request, or pass it on to the http in node by calling next();\n    //    // Optionally skip our rawBodyParser by setting this to true;\n    //    //req.skipRawBodyParser = true;\n    //    next();\n    //},\n\n    /** When httpAdminRoot is used to move the UI to a different root path, the\n     * following property can be used to identify a directory of static content\n     * that should be served at http://localhost:1880/.\n     * When httpStaticRoot is set differently to httpAdminRoot, there is no need\n     * to move httpAdminRoot\n     */\n    //httpStatic: '/home/nol/node-red-static/', //single static source\n    /**\n     *  OR multiple static sources can be created using an array of objects...\n     *  Each object can also contain an options object for further configuration.\n     *  See https://expressjs.com/en/api.html#express.static for available options.\n     */\n    //httpStatic: [\n    //    {path: '/home/nol/pics/',    root: \"/img/\"},\n    //    {path: '/home/nol/reports/', root: \"/doc/\"},\n    //    {path: '/home/nol/videos/',  root: \"/vid/\", options: {maxAge: '1d'}}\n    //],\n\n    /**\n     * All static routes will be appended to httpStaticRoot\n     * e.g. if httpStatic = \"/home/nol/docs\" and  httpStaticRoot = \"/static/\"\n     *      then \"/home/nol/docs\" will be served at \"/static/\"\n     * e.g. if httpStatic = [{path: '/home/nol/pics/', root: \"/img/\"}]\n     *      and httpStaticRoot = \"/static/\"\n     *      then \"/home/nol/pics/\" will be served at \"/static/img/\"\n     */\n    //httpStaticRoot: '/static/',\n\n/*******************************************************************************\n * Runtime Settings\n *  - lang\n *  - runtimeState\n *  - diagnostics\n *  - logging\n *  - contextStorage\n *  - exportGlobalContextKeys\n *  - externalModules\n ******************************************************************************/\n\n    /** Uncomment the following to run node-red in your preferred language.\n     * Available languages include: en-US (default), ja, de, zh-CN, zh-TW, ru, ko\n     * Some languages are more complete than others.\n     */\n    // lang: \"de\",\n\n    /** Configure diagnostics options\n     * - enabled:  When `enabled` is `true` (or unset), diagnostics data will\n     *   be available at http://localhost:1880/diagnostics\n     * - ui: When `ui` is `true` (or unset), the action `show-system-info` will\n     *   be available to logged in users of node-red editor\n    */\n    diagnostics: {\n        /** enable or disable diagnostics endpoint. Must be set to `false` to disable */\n        enabled: true,\n        /** enable or disable diagnostics display in the node-red editor. Must be set to `false` to disable */\n        ui: true,\n    },\n    /** Configure runtimeState options\n     * - enabled:  When `enabled` is `true` flows runtime can be Started/Stopped\n     *   by POSTing to available at http://localhost:1880/flows/state\n     * - ui: When `ui` is `true`, the action `core:start-flows` and\n     *   `core:stop-flows` will be available to logged in users of node-red editor\n     *   Also, the deploy menu (when set to default) will show a stop or start button\n     */\n    runtimeState: {\n        /** enable or disable flows/state endpoint. Must be set to `false` to disable */\n        enabled: false,\n        /** show or hide runtime stop/start options in the node-red editor. Must be set to `false` to hide */\n        ui: false,\n    },\n    /** Configure the logging output */\n    logging: {\n        /** Only console logging is currently supported */\n        console: {\n            /** Level of logging to be recorded. Options are:\n             * fatal - only those errors which make the application unusable should be recorded\n             * error - record errors which are deemed fatal for a particular request + fatal errors\n             * warn - record problems which are non fatal + errors + fatal errors\n             * info - record information about the general running of the application + warn + error + fatal errors\n             * debug - record information which is more verbose than info + info + warn + error + fatal errors\n             * trace - record very detailed logging + debug + info + warn + error + fatal errors\n             * off - turn off all logging (doesn't affect metrics or audit)\n             */\n            level: \"info\",\n            /** Whether or not to include metric events in the log output */\n            metrics: false,\n            /** Whether or not to include audit events in the log output */\n            audit: false\n        }\n    },\n\n    /** Context Storage\n     * The following property can be used to enable context storage. The configuration\n     * provided here will enable file-based context that flushes to disk every 30 seconds.\n     * Refer to the documentation for further options: https://nodered.org/docs/api/context/\n     */\n    //contextStorage: {\n    //    default: {\n    //        module:\"localfilesystem\"\n    //    },\n    //},\n\n    /** `global.keys()` returns a list of all properties set in global context.\n     * This allows them to be displayed in the Context Sidebar within the editor.\n     * In some circumstances it is not desirable to expose them to the editor. The\n     * following property can be used to hide any property set in `functionGlobalContext`\n     * from being list by `global.keys()`.\n     * By default, the property is set to false to avoid accidental exposure of\n     * their values. Setting this to true will cause the keys to be listed.\n     */\n    exportGlobalContextKeys: false,\n\n    /** Configure how the runtime will handle external npm modules.\n     * This covers:\n     *  - whether the editor will allow new node modules to be installed\n     *  - whether nodes, such as the Function node are allowed to have their\n     * own dynamically configured dependencies.\n     * The allow/denyList options can be used to limit what modules the runtime\n     * will install/load. It can use '*' as a wildcard that matches anything.\n     */\n    externalModules: {\n        // autoInstall: false,   /** Whether the runtime will attempt to automatically install missing modules */\n        // autoInstallRetry: 30, /** Interval, in seconds, between reinstall attempts */\n        // palette: {              /** Configuration for the Palette Manager */\n        //     allowInstall: true, /** Enable the Palette Manager in the editor */\n        //     allowUpdate: true,  /** Allow modules to be updated in the Palette Manager */\n        //     allowUpload: true,  /** Allow module tgz files to be uploaded and installed */\n        //     allowList: ['*'],\n        //     denyList: [],\n        //     allowUpdateList: ['*'],\n        //     denyUpdateList: []\n        // },\n        // modules: {              /** Configuration for node-specified modules */\n        //     allowInstall: true,\n        //     allowList: [],\n        //     denyList: []\n        // }\n    },\n\n\n/*******************************************************************************\n * Editor Settings\n *  - disableEditor\n *  - editorTheme\n ******************************************************************************/\n\n    /** The following property can be used to disable the editor. The admin API\n     * is not affected by this option. To disable both the editor and the admin\n     * API, use either the httpRoot or httpAdminRoot properties\n     */\n    //disableEditor: false,\n\n    /** Customising the editor\n     * See https://nodered.org/docs/user-guide/runtime/configuration#editor-themes\n     * for all available options.\n     */\n    editorTheme: {\n        /** The following property can be used to set a custom theme for the editor.\n         * See https://github.com/node-red-contrib-themes/theme-collection for\n         * a collection of themes to chose from.\n         */\n        //theme: \"\",\n\n        /** To disable the 'Welcome to Node-RED' tour that is displayed the first\n         * time you access the editor for each release of Node-RED, set this to false\n         */\n        //tours: false,\n\n        palette: {\n            /** The following property can be used to order the categories in the editor\n             * palette. If a node's category is not in the list, the category will get\n             * added to the end of the palette.\n             * If not set, the following default order is used:\n             */\n            //categories: ['subflows', 'common', 'function', 'network', 'sequence', 'parser', 'storage'],\n        },\n\n        projects: {\n            /** To enable the Projects feature, set this value to true */\n            enabled: false,\n            workflow: {\n                /** Set the default projects workflow mode.\n                 *  - manual - you must manually commit changes\n                 *  - auto - changes are automatically committed\n                 * This can be overridden per-user from the 'Git config'\n                 * section of 'User Settings' within the editor\n                 */\n                mode: \"manual\"\n            }\n        },\n\n        codeEditor: {\n            /** Select the text editor component used by the editor.\n             * As of Node-RED V3, this defaults to \"monaco\", but can be set to \"ace\" if desired\n             */\n            lib: \"monaco\",\n            options: {\n                /** The follow options only apply if the editor is set to \"monaco\"\n                 *\n                 * theme - must match the file name of a theme in\n                 * packages/node_modules/@node-red/editor-client/src/vendor/monaco/dist/theme\n                 * e.g. \"tomorrow-night\", \"upstream-sunburst\", \"github\", \"my-theme\"\n                 */\n                // theme: \"vs\",\n                /** other overrides can be set e.g. fontSize, fontFamily, fontLigatures etc.\n                 * for the full list, see https://microsoft.github.io/monaco-editor/docs.html#interfaces/editor.IStandaloneEditorConstructionOptions.html\n                 */\n                //fontSize: 14,\n                //fontFamily: \"Cascadia Code, Fira Code, Consolas, 'Courier New', monospace\",\n                //fontLigatures: true,\n            }\n        },\n\n        markdownEditor: {\n            mermaid: {\n                /** enable or disable mermaid diagram in markdown document\n                 */\n                enabled: true\n            }\n        },\n\n    },\n\n/*******************************************************************************\n * Node Settings\n *  - fileWorkingDirectory\n *  - functionGlobalContext\n *  - functionExternalModules\n *  - functionTimeout\n *  - nodeMessageBufferMaxLength\n *  - ui (for use with Node-RED Dashboard)\n *  - debugUseColors\n *  - debugMaxLength\n *  - execMaxBufferSize\n *  - httpRequestTimeout\n *  - mqttReconnectTime\n *  - serialReconnectTime\n *  - socketReconnectTime\n *  - socketTimeout\n *  - tcpMsgQueueSize\n *  - inboundWebSocketTimeout\n *  - tlsConfigDisableLocalFiles\n *  - webSocketNodeVerifyClient\n ******************************************************************************/\n\n    /** The working directory to handle relative file paths from within the File nodes\n     * defaults to the working directory of the Node-RED process.\n     */\n    //fileWorkingDirectory: \"\",\n\n    /** Allow the Function node to load additional npm modules directly */\n    functionExternalModules: true,\n\n    /** Default timeout, in seconds, for the Function node. 0 means no timeout is applied */\n    functionTimeout: 0,\n\n    /** The following property can be used to set predefined values in Global Context.\n     * This allows extra node modules to be made available with in Function node.\n     * For example, the following:\n     *    functionGlobalContext: { os:require('os') }\n     * will allow the `os` module to be accessed in a Function node using:\n     *    global.get(\"os\")\n     */\n    functionGlobalContext: {\n        // os:require('os'),\n    },\n\n    /** The maximum number of messages nodes will buffer internally as part of their\n     * operation. This applies across a range of nodes that operate on message sequences.\n     * defaults to no limit. A value of 0 also means no limit is applied.\n     */\n    //nodeMessageBufferMaxLength: 0,\n\n    /** If you installed the optional node-red-dashboard you can set it's path\n     * relative to httpNodeRoot\n     * Other optional properties include\n     *  readOnly:{boolean},\n     *  middleware:{function or array}, (req,res,next) - http middleware\n     *  ioMiddleware:{function or array}, (socket,next) - socket.io middleware\n     */\n    //ui: { path: \"ui\" },\n\n    /** Colourise the console output of the debug node */\n    //debugUseColors: true,\n\n    /** The maximum length, in characters, of any message sent to the debug sidebar tab */\n    debugMaxLength: 1000,\n\n    /** Maximum buffer size for the exec node. Defaults to 10Mb */\n    //execMaxBufferSize: 10000000,\n\n    /** Timeout in milliseconds for HTTP request connections. Defaults to 120s */\n    //httpRequestTimeout: 120000,\n\n    /** Retry time in milliseconds for MQTT connections */\n    mqttReconnectTime: 15000,\n\n    /** Retry time in milliseconds for Serial port connections */\n    serialReconnectTime: 15000,\n\n    /** Retry time in milliseconds for TCP socket connections */\n    //socketReconnectTime: 10000,\n\n    /** Timeout in milliseconds for TCP server socket connections. Defaults to no timeout */\n    //socketTimeout: 120000,\n\n    /** Maximum number of messages to wait in queue while attempting to connect to TCP socket\n     * defaults to 1000\n     */\n    //tcpMsgQueueSize: 2000,\n\n    /** Timeout in milliseconds for inbound WebSocket connections that do not\n     * match any configured node. Defaults to 5000\n     */\n    //inboundWebSocketTimeout: 5000,\n\n    /** To disable the option for using local files for storing keys and\n     * certificates in the TLS configuration node, set this to true.\n     */\n    //tlsConfigDisableLocalFiles: true,\n\n    /** The following property can be used to verify WebSocket connection attempts.\n     * This allows, for example, the HTTP request headers to be checked to ensure\n     * they include valid authentication information.\n     */\n    //webSocketNodeVerifyClient: function(info) {\n    //    /** 'info' has three properties:\n    //    *   - origin : the value in the Origin header\n    //    *   - req : the HTTP request\n    //    *   - secure : true if req.connection.authorized or req.connection.encrypted is set\n    //    *\n    //    * The function should return true if the connection should be accepted, false otherwise.\n    //    *\n    //    * Alternatively, if this function is defined to accept a second argument, callback,\n    //    * it can be used to verify the client asynchronously.\n    //    * The callback takes three arguments:\n    //    *   - result : boolean, whether to accept the connection or not\n    //    *   - code : if result is false, the HTTP error status to return\n    //    *   - reason: if result is false, the HTTP reason string to return\n    //    */\n    //},\n}\n",
        "output": "str",
        "x": 330,
        "y": 280,
        "wires": [
            [
                "58ea5db35da539ff"
            ]
        ]
    },
    {
        "id": "a52103dda335e746",
        "type": "inject",
        "z": "0f371fda47db1155",
        "name": "",
        "props": [
            {
                "p": "payload"
            },
            {
                "p": "topic",
                "vt": "str"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 140,
        "y": 280,
        "wires": [
            [
                "728e65817d3a3c8f"
            ]
        ]
    },
    {
        "id": "58ea5db35da539ff",
        "type": "file",
        "z": "0f371fda47db1155",
        "name": "",
        "filename": "/usr/local/packages/Nodered/opt/sdcard/NodeRED/node-red-data/settings.js",
        "filenameType": "str",
        "appendNewline": true,
        "createDir": false,
        "overwriteFile": "true",
        "encoding": "none",
        "x": 730,
        "y": 280,
        "wires": [
            []
        ]
    },
    {
        "id": "d043c8420cd100cb",
        "type": "bcrypt",
        "z": "0f371fda47db1155",
        "name": "",
        "action": "encrypt",
        "field": "payload",
        "hash": "payload",
        "target": "payload",
        "assignment": "replace",
        "match": "match",
        "outputs": 1,
        "rounds": "12",
        "x": 530,
        "y": 140,
        "wires": [
            [
                "f81ed4a10cf294f4"
            ]
        ]
    },
    {
        "id": "e2ac2f0a137d9c4c",
        "type": "inject",
        "z": "0f371fda47db1155",
        "name": "",
        "props": [
            {
                "p": "payload"
            },
            {
                "p": "topic",
                "vt": "str"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 150,
        "y": 140,
        "wires": [
            [
                "df534183b3614c60"
            ]
        ]
    },
    {
        "id": "df534183b3614c60",
        "type": "change",
        "z": "0f371fda47db1155",
        "name": "Set password here",
        "rules": [
            {
                "t": "set",
                "p": "payload",
                "pt": "msg",
                "to": "some password",
                "tot": "str"
            }
        ],
        "action": "",
        "property": "",
        "from": "",
        "to": "",
        "reg": false,
        "x": 340,
        "y": 140,
        "wires": [
            [
                "d043c8420cd100cb"
            ]
        ]
    },
    {
        "id": "f81ed4a10cf294f4",
        "type": "debug",
        "z": "0f371fda47db1155",
        "name": "hash output",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 690,
        "y": 140,
        "wires": []
    },
    {
        "id": "b1ccb05a29964c2b",
        "type": "comment",
        "z": "0f371fda47db1155",
        "name": "2 Create a password hash by editing the \"Set password here\" node",
        "info": "",
        "x": 320,
        "y": 100,
        "wires": []
    },
    {
        "id": "a6dcb7cf3737d32b",
        "type": "comment",
        "z": "0f371fda47db1155",
        "name": "3 Double-click \"settings.js\", paste your hash over the old password hash on line 82.",
        "info": "",
        "x": 370,
        "y": 200,
        "wires": []
    },
    {
        "id": "b37ca1f72a112740",
        "type": "comment",
        "z": "0f371fda47db1155",
        "name": "You may also want to adjust the Time zone on line 23",
        "info": "",
        "x": 270,
        "y": 240,
        "wires": []
    },
    {
        "id": "86b45307428f26c2",
        "type": "comment",
        "z": "0f371fda47db1155",
        "name": "4 Inject the new file",
        "info": "",
        "x": 170,
        "y": 400,
        "wires": []
    },
    {
        "id": "e9d3ac0f5a0b3bd0",
        "type": "comment",
        "z": "0f371fda47db1155",
        "name": "4 Restart Node-RED",
        "info": "",
        "x": 170,
        "y": 460,
        "wires": []
    },
    {
        "id": "348b512a27f07d48",
        "type": "comment",
        "z": "0f371fda47db1155",
        "name": "1 Import the bcrypt node. [Menu | Manage Palette | Install ] bgrypt",
        "info": "",
        "x": 310,
        "y": 60,
        "wires": []
    }
]