var ExprAE;
(function (ExprAE) {
    class D {
        static RGB32(r, g, b, a = 255) {
            return (a & 255) << 24 | (b & 255) << 16 | (g & 255) << 8 | r & 255;
        }
        static SetBuf32(buf, pitch, x, y, c) {
            buf[y * pitch + x] = c;
        }
        static IS_UD(a) {
            return a == undefined;
        }
        static IS_INFM(a) {
            return a == Number.NEGATIVE_INFINITY;
        }
        static IS_INFP(a) {
            return a == Number.POSITIVE_INFINITY;
        }
    }
    ExprAE.D = D;
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    class Main {
        main() {
            ExprAE.System.CSys.Init();
            var library = new ExprAE.Expressions.CLib();
            var stdlib = new ExprAE.Expressions.Stdlib();
            stdlib.init(library);
            this.expr = new ExprAE.Expressions.CExpr(library);
            var libwin = new ExprAE.Console.CLibWin(ExprAE.System.CSys.ScrWidth, ExprAE.System.CSys.ScrHeight, ExprAE.System.CSys.getBuf(), 20, 20, ExprAE.System.CSys.ScrWidth - 20, ExprAE.System.CSys.ScrHeight * 2 / 3, library);
            var con = new ExprAE.Console.CCon(ExprAE.System.CSys.ScrWidth, ExprAE.System.CSys.ScrHeight, ExprAE.System.CSys.getBuf(), this.comp.bind(this), libwin);
            var graphTester = new ExprAE.Graph.CGraphTester(ExprAE.System.CSys.ScrWidth, ExprAE.System.CSys.ScrHeight, ExprAE.System.CSys.getBuf());
            this.graph = new ExprAE.Graph.CGraph(ExprAE.System.CSys.ScrWidth, ExprAE.System.CSys.ScrHeight, ExprAE.System.CSys.getBuf(), stdlib);
            var imagesLib = new ExprAE.Libraries.Images(this.graph);
            imagesLib.init(library);
            ExprAE.System.CSys.SetWindow(con, ExprAE.System.Windows.Win_Con);
            ExprAE.System.CSys.SetWindow(this.graph, ExprAE.System.Windows.Win_Graph);
            ExprAE.System.CSys.SetWindow(graphTester, ExprAE.System.Windows.Win_GraphTester);
            ExprAE.System.CSys.SetActiveWindow(ExprAE.System.Windows.Win_Con);
            con.Exec("sin(dist(x,y))");
            ExprAE.System.CSys.Run();
        }
        comp(s) {
            var th = this;
            var result = th.expr.set(s);
            if (result == ExprAE.Expressions.ErrorCodes.NoErr) {
                var value = th.expr.do();
                if (typeof value == "number") {
                    th.graph.SetExpr(s, th.expr, ExprAE.System.CSys.DColor, ExprAE.System.CSys.DColor);
                    return s + "=" + value;
                }
                else {
                    th.graph.SetExpr(s, undefined, ExprAE.System.CSys.DColor, ExprAE.System.CSys.DColor);
                    return value;
                }
            }
            else {
                return "\u0004" + ExprAE.Expressions.ErrorCodes[result];
            }
        }
    }
    ExprAE.Main = Main;
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    var System;
    (function (System) {
        class CMenu {
        }
        System.CMenu = CMenu;
    })(System = ExprAE.System || (ExprAE.System = {}));
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    var System;
    (function (System) {
        class CSys {
            static SetCur() {
                CSys.cursor = 1 - CSys.cursor;
            }
            static Init() {
                var canvas = CSys.getDrawingCanvas();
                CSys.ScrWidth = canvas.width;
                CSys.ScrHeight = canvas.height;
                CSys.varlib = new ExprAE.Expressions.CLib();
                CSys.AddVar("scrwidth", CSys.__ScrWidth, CSys.VAR_DWORD);
                CSys.AddVar("scrheight", CSys.__ScrHeight, CSys.VAR_DWORD);
                CSys.AddVar("color", CSys.__Color, CSys.VAR_RGB);
                CSys.ExecCfg();
                CSys.DelVar("scrwidth");
                CSys.DelVar("scrheight");
                CSys.VidMode(CSys.ScrWidth, CSys.ScrHeight);
                CSys.SRand0 = (new Date().getTime());
                CSys.initEvents();
            }
            static initEvents() {
                document.onkeydown = function (event) {
                    event = event || window.event;
                    if (event.keyCode == System.Keys.K_BACK_SPACE
                        || event.keyCode == System.Keys.K_F1
                        || event.keyCode == System.Keys.K_F4
                        || event.keyCode == System.Keys.K_F5
                        || event.keyCode == System.Keys.K_F6
                        || event.keyCode == System.Keys.K_F7
                        || event.keyCode == System.Keys.K_TAB) {
                        event.preventDefault();
                        event.returnValue = false;
                    }
                    CSys.keytab[event.keyCode] = 1;
                };
                document.onkeyup = function (event) {
                    event = event || window.event;
                    CSys.keytab[event.keyCode] = 0;
                };
                document.onmousedown = function (event) {
                    CSys.mousekeystate[event.button] = 1;
                };
                document.onmouseup = function (event) {
                    CSys.mousekeystate[event.button] = 0;
                };
                document.onmousemove = function (event) {
                    CSys.mouseX = event.offsetX;
                    CSys.mouseY = event.offsetY;
                    CSys.lockMouseX += event.movementX;
                    CSys.lockMouseY += event.movementY;
                };
                document.onwheel = function (event) {
                    CSys.mouseWhellDelta = -event.deltaY;
                };
                document.addEventListener('contextmenu', event => {
                    event.preventDefault();
                    event.returnValue = false;
                });
            }
            static Run() {
                {
                    var md = CSys.GetMouseWheelDelta();
                    if (md > 0)
                        CSys.SimulateKey(System.Keys.K_PAGE_UP);
                    if (md < 0)
                        CSys.SimulateKey(System.Keys.K_PAGE_DOWN);
                    for (var i = 0; i < 256; i++)
                        CSys.keytab[i] |= CSys.simulatedkeytab[i];
                    var shift = 0, ctrl = 0;
                    if (CSys.KeyPressed(System.Keys.K_SHIFT))
                        shift = 256;
                    if (CSys.GetKey(System.Keys.K_CONTROL))
                        ctrl = 65536;
                    if (ctrl == 0) {
                        for (var i = 0; i < 256; i++) {
                            if (CSys.KeyPressed(i))
                                CSys.activeWin().KeyFunc(i | shift);
                        }
                        if (CSys.MouseKey()) {
                            CSys.windows[CSys.activewin].KeyFunc(shift);
                            if (CSys.activewin == Windows.Win_Con) {
                                CSys.mousekeystate = [];
                            }
                        }
                        if (CSys.KeyPressed(System.Keys.K_F1)) {
                            window.open('help.html', '_blank');
                        }
                        if (CSys.KeyPressed(System.Keys.K_F4)) {
                            CSys.SetActiveWindow(Windows.Win_Con);
                        }
                        if (CSys.KeyPressed(System.Keys.K_F5)) {
                            CSys.SetActiveWindow(Windows.Win_Graph);
                        }
                        if (CSys.KeyPressed(System.Keys.K_F6)) {
                            CSys.SetActiveWindow(Windows.Win_GraphTester);
                        }
                    }
                    else {
                    }
                    shift = CSys.keytab[System.Keys.K_SHIFT];
                    ctrl = CSys.keytab[System.Keys.K_CONTROL];
                    for (var i = 0; i < 256; i++)
                        CSys.keytab[i] = 0;
                    CSys.keytab[System.Keys.K_SHIFT] = shift;
                    CSys.keytab[System.Keys.K_CONTROL] = ctrl;
                    for (var i = 0; i < 256; i++) {
                        CSys.keytab[i] &= ~CSys.simulatedkeytab[i];
                        CSys.simulatedkeytab[i] = 0;
                    }
                    if (CSys.activeWin().GetBuf() != CSys.getBuf())
                        CSys.activeWin().Change(CSys.getBuf());
                    CSys.activeWin().Process();
                    if (CSys.PresentWait == 0)
                        CSys.presentBuf();
                }
                requestAnimationFrame(CSys.Run);
            }
            static activeWin() {
                return CSys.windows[CSys.activewin];
            }
            static SetWindow(w, num) {
                CSys.windows[num] = w;
            }
            static SetActiveWindow(num) {
                CSys.windows[CSys.activewin].ChangeActiveState(0);
                CSys.activewin = num;
                CSys.windows[CSys.activewin].ChangeActiveState(1);
                CSys.unlockMouse();
            }
            static KeyPressed(code) {
                return CSys.keytab[code.valueOf()] == 1;
            }
            static GetKey(code) {
                var pressed = CSys.keytab[code.valueOf()] == 1;
                CSys.keytab[code.valueOf()] = 0;
                return pressed;
            }
            static getBuf() {
                if (!CSys.buf) {
                    var ctx = CSys.getDrawingContext();
                    CSys.imgData = ctx.getImageData(0, 0, CSys.ScrWidth, CSys.ScrHeight);
                    var data = CSys.imgData.data;
                    var arrayBuf = new ArrayBuffer(CSys.imgData.data.length);
                    CSys.buf8 = new Uint8ClampedArray(arrayBuf);
                    CSys.buf = new Uint32Array(arrayBuf);
                }
                return CSys.buf;
            }
            static getDrawingCanvas() {
                return document.getElementById("buf");
            }
            static getDrawingContext() {
                return CSys.getDrawingCanvas().getContext("2d");
            }
            static presentBuf() {
                CSys.imgData.data.set(CSys.buf8);
                var ctx = CSys.getDrawingContext();
                ctx.putImageData(CSys.imgData, 0, 0);
            }
            static GetMouseWheelDelta() {
                var delta = CSys.mouseWhellDelta;
                CSys.mouseWhellDelta = 0;
                return delta;
            }
            static SimulateKey(code) {
                CSys.simulatedkeytab[code.valueOf()] = 1;
            }
            static MouseKeyPressed(key) {
                return CSys.mousekeystate[key.valueOf()] == 1;
            }
            static MouseKey() {
                return CSys.mousekeystate[System.Keys.M_LEFT] | CSys.mousekeystate[System.Keys.M_RIGHT] << 1;
            }
            static getMouseX() {
                return CSys.isMouseLocked ? CSys.lockMouseX : CSys.mouseX;
            }
            static getMouseY() {
                return CSys.isMouseLocked ? CSys.lockMouseY : CSys.mouseY;
            }
            static cursorPosSet(x, y) {
                CSys.lockMouseX = CSys.mouseX;
                CSys.lockMouseY = CSys.mouseY;
                if (x < 0 && CSys.isMouseLocked) {
                    CSys.unlockMouse();
                }
                else if (x >= 0 && !CSys.isMouseLocked) {
                    CSys.getDrawingCanvas().requestPointerLock();
                    CSys.isMouseLocked = true;
                }
            }
            static unlockMouse() {
                document.exitPointerLock();
                CSys.isMouseLocked = false;
            }
            static AddVar(name, addr, flags) {
                var e = new ExprAE.Expressions.ELEMENT(name, addr, 0, 0, 0, flags);
                CSys.varlib.addElement(e);
            }
            static DelVar(name) {
                CSys.varlib.delElement(name);
            }
            static ExecCfg() {
            }
            static VidMode(w, h) {
            }
            static GetTime() {
                return new Date().getTime() / 1000;
            }
            static __ScrWidth(...args) {
                if (args.length == 1)
                    CSys.ScrWidth = args[0];
                else
                    return CSys.ScrWidth;
            }
            static __ScrHeight(...args) {
                if (args.length == 1)
                    CSys.ScrWidth = args[0];
                else
                    return CSys.ScrWidth;
            }
            static __Color(...args) {
                if (args.length == 1)
                    CSys.Color = args[0];
                else
                    return CSys.Color;
            }
        }
        CSys.MAXWIN = 5;
        CSys.MAXLIB = 8;
        CSys.OPTMIXBUFLEN_SEC = 0.08;
        CSys.RECORDINPUTSOUNDBUFLEN = 65536;
        CSys.TITLETEXT = "ExprAE v. 0.1";
        CSys.VAR_DWORD = 0;
        CSys.VAR_FLOAT = 1;
        CSys.VAR_BYTE = 2;
        CSys.VAR_WORD = 3;
        CSys.VAR_RGB = 4;
        CSys.VAR_STR = 5;
        CSys.CNormal = 0;
        CSys.CHighlighted = 1;
        CSys.CFaded = 2;
        CSys.CFavour = 3;
        CSys.CHelp = 4;
        CSys.CNum = 5;
        CSys.COp = 6;
        CSys.CTxt = 7;
        CSys.CPattern = 8;
        CSys.Color = new Array(ExprAE.D.RGB32(210, 210, 210), ExprAE.D.RGB32(230, 230, 230), ExprAE.D.RGB32(128, 128, 128), ExprAE.D.RGB32(240, 0, 0), ExprAE.D.RGB32(240, 240, 0), ExprAE.D.RGB32(128, 240, 240), ExprAE.D.RGB32(200, 200, 240), ExprAE.D.RGB32(255, 0, 0), ExprAE.D.RGB32(0, 0, 0));
        CSys.windows = [];
        CSys.activewin = 0;
        CSys.simulatedkeytab = [];
        CSys.keytab = [];
        CSys.mousekeystate = [];
        CSys.DColor = 0;
        CSys.PresentWait = 0;
        CSys.ScrWidth = 640;
        CSys.ScrHeight = 480;
        CSys.ScrBpp = 32;
        CSys.SoundOn = 0;
        CSys.SoundFreq = 44100;
        CSys.SoundBPS = 16;
        CSys.SoundChannels = 2;
        CSys.SoundMixerBufSize = 0;
        CSys.SRand0 = 0;
        CSys.cursor = 1;
        CSys.isMouseLocked = false;
        System.CSys = CSys;
        (function (Windows) {
            Windows[Windows["Win_Con"] = 0] = "Win_Con";
            Windows[Windows["Win_Graph"] = 1] = "Win_Graph";
            Windows[Windows["Win_GraphTester"] = 2] = "Win_GraphTester";
            Windows[Windows["Win_Sound"] = 3] = "Win_Sound";
            Windows[Windows["Win_Help"] = 4] = "Win_Help";
            Windows[Windows["Win_Winlib"] = 5] = "Win_Winlib";
        })(System.Windows || (System.Windows = {}));
        var Windows = System.Windows;
        ;
    })(System = ExprAE.System || (ExprAE.System = {}));
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    var System;
    (function (System) {
        (function (Keys) {
            Keys[Keys["OM_VK_CANCEL"] = 3] = "OM_VK_CANCEL";
            Keys[Keys["K_HELP"] = 6] = "K_HELP";
            Keys[Keys["K_BACK_SPACE"] = 8] = "K_BACK_SPACE";
            Keys[Keys["K_TAB"] = 9] = "K_TAB";
            Keys[Keys["K_CLEAR"] = 12] = "K_CLEAR";
            Keys[Keys["K_RETURN"] = 13] = "K_RETURN";
            Keys[Keys["K_ENTER"] = 13] = "K_ENTER";
            Keys[Keys["K_SHIFT"] = 16] = "K_SHIFT";
            Keys[Keys["K_CONTROL"] = 17] = "K_CONTROL";
            Keys[Keys["K_ALT"] = 18] = "K_ALT";
            Keys[Keys["K_PAUSE"] = 19] = "K_PAUSE";
            Keys[Keys["K_CAPS_LOCK"] = 20] = "K_CAPS_LOCK";
            Keys[Keys["K_KANA"] = 21] = "K_KANA";
            Keys[Keys["K_HANGUL"] = 21] = "K_HANGUL";
            Keys[Keys["K_EISU"] = 22] = "K_EISU";
            Keys[Keys["K_JUNJA"] = 23] = "K_JUNJA";
            Keys[Keys["K_FINAL"] = 24] = "K_FINAL";
            Keys[Keys["K_HANJA"] = 25] = "K_HANJA";
            Keys[Keys["K_KANJI"] = 25] = "K_KANJI";
            Keys[Keys["K_ESCAPE"] = 27] = "K_ESCAPE";
            Keys[Keys["K_CONVERT"] = 28] = "K_CONVERT";
            Keys[Keys["K_NONCONVERT"] = 29] = "K_NONCONVERT";
            Keys[Keys["K_ACCEPT"] = 30] = "K_ACCEPT";
            Keys[Keys["K_MODECHANGE"] = 31] = "K_MODECHANGE";
            Keys[Keys["K_SPACE"] = 32] = "K_SPACE";
            Keys[Keys["K_PAGE_UP"] = 33] = "K_PAGE_UP";
            Keys[Keys["K_PAGE_DOWN"] = 34] = "K_PAGE_DOWN";
            Keys[Keys["K_END"] = 35] = "K_END";
            Keys[Keys["K_HOME"] = 36] = "K_HOME";
            Keys[Keys["K_LEFT"] = 37] = "K_LEFT";
            Keys[Keys["K_UP"] = 38] = "K_UP";
            Keys[Keys["K_RIGHT"] = 39] = "K_RIGHT";
            Keys[Keys["K_DOWN"] = 40] = "K_DOWN";
            Keys[Keys["K_SELECT"] = 41] = "K_SELECT";
            Keys[Keys["K_PRINT"] = 42] = "K_PRINT";
            Keys[Keys["K_EXECUTE"] = 43] = "K_EXECUTE";
            Keys[Keys["K_PRINTSCREEN"] = 44] = "K_PRINTSCREEN";
            Keys[Keys["K_INSERT"] = 45] = "K_INSERT";
            Keys[Keys["K_DELETE"] = 46] = "K_DELETE";
            Keys[Keys["K_0"] = 48] = "K_0";
            Keys[Keys["K_1"] = 49] = "K_1";
            Keys[Keys["K_2"] = 50] = "K_2";
            Keys[Keys["K_3"] = 51] = "K_3";
            Keys[Keys["K_4"] = 52] = "K_4";
            Keys[Keys["K_5"] = 53] = "K_5";
            Keys[Keys["K_6"] = 54] = "K_6";
            Keys[Keys["K_7"] = 55] = "K_7";
            Keys[Keys["K_8"] = 56] = "K_8";
            Keys[Keys["K_9"] = 57] = "K_9";
            Keys[Keys["K_COLON"] = 58] = "K_COLON";
            Keys[Keys["K_SEMICOLON"] = 59] = "K_SEMICOLON";
            Keys[Keys["K_LESS_THAN"] = 60] = "K_LESS_THAN";
            Keys[Keys["K_EQUALS"] = 61] = "K_EQUALS";
            Keys[Keys["K_GREATER_THAN"] = 62] = "K_GREATER_THAN";
            Keys[Keys["K_QUESTION_MARK"] = 63] = "K_QUESTION_MARK";
            Keys[Keys["K_AT"] = 64] = "K_AT";
            Keys[Keys["K_A"] = 65] = "K_A";
            Keys[Keys["K_B"] = 66] = "K_B";
            Keys[Keys["K_C"] = 67] = "K_C";
            Keys[Keys["K_D"] = 68] = "K_D";
            Keys[Keys["K_E"] = 69] = "K_E";
            Keys[Keys["K_F"] = 70] = "K_F";
            Keys[Keys["K_G"] = 71] = "K_G";
            Keys[Keys["K_H"] = 72] = "K_H";
            Keys[Keys["K_I"] = 73] = "K_I";
            Keys[Keys["K_J"] = 74] = "K_J";
            Keys[Keys["K_K"] = 75] = "K_K";
            Keys[Keys["K_L"] = 76] = "K_L";
            Keys[Keys["K_M"] = 77] = "K_M";
            Keys[Keys["K_N"] = 78] = "K_N";
            Keys[Keys["K_O"] = 79] = "K_O";
            Keys[Keys["K_P"] = 80] = "K_P";
            Keys[Keys["K_Q"] = 81] = "K_Q";
            Keys[Keys["K_R"] = 82] = "K_R";
            Keys[Keys["K_S"] = 83] = "K_S";
            Keys[Keys["K_T"] = 84] = "K_T";
            Keys[Keys["K_U"] = 85] = "K_U";
            Keys[Keys["K_V"] = 86] = "K_V";
            Keys[Keys["K_W"] = 87] = "K_W";
            Keys[Keys["K_X"] = 88] = "K_X";
            Keys[Keys["K_Y"] = 89] = "K_Y";
            Keys[Keys["K_Z"] = 90] = "K_Z";
            Keys[Keys["K_WIN"] = 91] = "K_WIN";
            Keys[Keys["K_CONTEXT_MENU"] = 93] = "K_CONTEXT_MENU";
            Keys[Keys["K_SLEEP"] = 95] = "K_SLEEP";
            Keys[Keys["K_NUMPAD0"] = 96] = "K_NUMPAD0";
            Keys[Keys["K_NUMPAD1"] = 97] = "K_NUMPAD1";
            Keys[Keys["K_NUMPAD2"] = 98] = "K_NUMPAD2";
            Keys[Keys["K_NUMPAD3"] = 99] = "K_NUMPAD3";
            Keys[Keys["K_NUMPAD4"] = 100] = "K_NUMPAD4";
            Keys[Keys["K_NUMPAD5"] = 101] = "K_NUMPAD5";
            Keys[Keys["K_NUMPAD6"] = 102] = "K_NUMPAD6";
            Keys[Keys["K_NUMPAD7"] = 103] = "K_NUMPAD7";
            Keys[Keys["K_NUMPAD8"] = 104] = "K_NUMPAD8";
            Keys[Keys["K_NUMPAD9"] = 105] = "K_NUMPAD9";
            Keys[Keys["K_MULTIPLY"] = 106] = "K_MULTIPLY";
            Keys[Keys["K_ADD"] = 107] = "K_ADD";
            Keys[Keys["K_SEPARATOR"] = 108] = "K_SEPARATOR";
            Keys[Keys["K_SUBTRACT"] = 109] = "K_SUBTRACT";
            Keys[Keys["K_DECIMAL"] = 110] = "K_DECIMAL";
            Keys[Keys["K_DIVIDE"] = 111] = "K_DIVIDE";
            Keys[Keys["K_F1"] = 112] = "K_F1";
            Keys[Keys["K_F2"] = 113] = "K_F2";
            Keys[Keys["K_F3"] = 114] = "K_F3";
            Keys[Keys["K_F4"] = 115] = "K_F4";
            Keys[Keys["K_F5"] = 116] = "K_F5";
            Keys[Keys["K_F6"] = 117] = "K_F6";
            Keys[Keys["K_F7"] = 118] = "K_F7";
            Keys[Keys["K_F8"] = 119] = "K_F8";
            Keys[Keys["K_F9"] = 120] = "K_F9";
            Keys[Keys["K_F10"] = 121] = "K_F10";
            Keys[Keys["K_F11"] = 122] = "K_F11";
            Keys[Keys["K_F12"] = 123] = "K_F12";
            Keys[Keys["K_F13"] = 124] = "K_F13";
            Keys[Keys["K_F14"] = 125] = "K_F14";
            Keys[Keys["K_F15"] = 126] = "K_F15";
            Keys[Keys["K_F16"] = 127] = "K_F16";
            Keys[Keys["K_F17"] = 128] = "K_F17";
            Keys[Keys["K_F18"] = 129] = "K_F18";
            Keys[Keys["K_F19"] = 130] = "K_F19";
            Keys[Keys["K_F20"] = 131] = "K_F20";
            Keys[Keys["K_F21"] = 132] = "K_F21";
            Keys[Keys["K_F22"] = 133] = "K_F22";
            Keys[Keys["K_F23"] = 134] = "K_F23";
            Keys[Keys["K_F24"] = 135] = "K_F24";
            Keys[Keys["K_NUM_LOCK"] = 144] = "K_NUM_LOCK";
            Keys[Keys["K_SCROLL_LOCK"] = 145] = "K_SCROLL_LOCK";
            Keys[Keys["K_WIN_OEM_FJ_JISHO"] = 146] = "K_WIN_OEM_FJ_JISHO";
            Keys[Keys["K_WIN_OEM_FJ_MASSHOU"] = 147] = "K_WIN_OEM_FJ_MASSHOU";
            Keys[Keys["K_WIN_OEM_FJ_TOUROKU"] = 148] = "K_WIN_OEM_FJ_TOUROKU";
            Keys[Keys["K_WIN_OEM_FJ_LOYA"] = 149] = "K_WIN_OEM_FJ_LOYA";
            Keys[Keys["K_WIN_OEM_FJ_ROYA"] = 150] = "K_WIN_OEM_FJ_ROYA";
            Keys[Keys["K_CIRCUMFLEX"] = 160] = "K_CIRCUMFLEX";
            Keys[Keys["K_EXCLAMATION"] = 161] = "K_EXCLAMATION";
            Keys[Keys["K_DOUBLE_QUOTE"] = 162] = "K_DOUBLE_QUOTE";
            Keys[Keys["K_HASH"] = 163] = "K_HASH";
            Keys[Keys["K_DOLLAR"] = 164] = "K_DOLLAR";
            Keys[Keys["K_PERCENT"] = 165] = "K_PERCENT";
            Keys[Keys["K_AMPERSAND"] = 166] = "K_AMPERSAND";
            Keys[Keys["K_UNDERSCORE"] = 167] = "K_UNDERSCORE";
            Keys[Keys["K_OPEN_PAREN"] = 168] = "K_OPEN_PAREN";
            Keys[Keys["K_CLOSE_PAREN"] = 169] = "K_CLOSE_PAREN";
            Keys[Keys["K_ASTERISK"] = 170] = "K_ASTERISK";
            Keys[Keys["K_PLUS"] = 171] = "K_PLUS";
            Keys[Keys["K_PIPE"] = 172] = "K_PIPE";
            Keys[Keys["K_HYPHEN_MINUS"] = 173] = "K_HYPHEN_MINUS";
            Keys[Keys["K_OPEN_CURLY_BRACKET"] = 174] = "K_OPEN_CURLY_BRACKET";
            Keys[Keys["K_CLOSE_CURLY_BRACKET"] = 175] = "K_CLOSE_CURLY_BRACKET";
            Keys[Keys["K_TILDE"] = 176] = "K_TILDE";
            Keys[Keys["K_VOLUME_MUTE"] = 181] = "K_VOLUME_MUTE";
            Keys[Keys["K_VOLUME_DOWN"] = 182] = "K_VOLUME_DOWN";
            Keys[Keys["K_VOLUME_UP"] = 183] = "K_VOLUME_UP";
            Keys[Keys["K_SEMICOLON2"] = 186] = "K_SEMICOLON2";
            Keys[Keys["K_EQUAL"] = 187] = "K_EQUAL";
            Keys[Keys["K_COMMA"] = 188] = "K_COMMA";
            Keys[Keys["K_MINUS"] = 189] = "K_MINUS";
            Keys[Keys["K_PERIOD"] = 190] = "K_PERIOD";
            Keys[Keys["K_SLASH"] = 191] = "K_SLASH";
            Keys[Keys["K_BACK_QUOTE"] = 192] = "K_BACK_QUOTE";
            Keys[Keys["K_OPEN_BRACKET"] = 219] = "K_OPEN_BRACKET";
            Keys[Keys["K_BACK_SLASH"] = 220] = "K_BACK_SLASH";
            Keys[Keys["K_CLOSE_BRACKET"] = 221] = "K_CLOSE_BRACKET";
            Keys[Keys["K_QUOTE"] = 222] = "K_QUOTE";
            Keys[Keys["K_META"] = 224] = "K_META";
            Keys[Keys["K_ALTGR"] = 225] = "K_ALTGR";
            Keys[Keys["K_WIN_ICO_HELP"] = 227] = "K_WIN_ICO_HELP";
            Keys[Keys["K_WIN_ICO_00"] = 228] = "K_WIN_ICO_00";
            Keys[Keys["K_WIN_ICO_CLEAR"] = 230] = "K_WIN_ICO_CLEAR";
            Keys[Keys["K_WIN_OEM_RESET"] = 233] = "K_WIN_OEM_RESET";
            Keys[Keys["K_WIN_OEM_JUMP"] = 234] = "K_WIN_OEM_JUMP";
            Keys[Keys["K_WIN_OEM_PA1"] = 235] = "K_WIN_OEM_PA1";
            Keys[Keys["K_WIN_OEM_PA2"] = 236] = "K_WIN_OEM_PA2";
            Keys[Keys["K_WIN_OEM_PA3"] = 237] = "K_WIN_OEM_PA3";
            Keys[Keys["K_WIN_OEM_WSCTRL"] = 238] = "K_WIN_OEM_WSCTRL";
            Keys[Keys["K_WIN_OEM_CUSEL"] = 239] = "K_WIN_OEM_CUSEL";
            Keys[Keys["K_WIN_OEM_ATTN"] = 240] = "K_WIN_OEM_ATTN";
            Keys[Keys["K_WIN_OEM_FINISH"] = 241] = "K_WIN_OEM_FINISH";
            Keys[Keys["K_WIN_OEM_COPY"] = 242] = "K_WIN_OEM_COPY";
            Keys[Keys["K_WIN_OEM_AUTO"] = 243] = "K_WIN_OEM_AUTO";
            Keys[Keys["K_WIN_OEM_ENLW"] = 244] = "K_WIN_OEM_ENLW";
            Keys[Keys["K_WIN_OEM_BACKTAB"] = 245] = "K_WIN_OEM_BACKTAB";
            Keys[Keys["K_ATTN"] = 246] = "K_ATTN";
            Keys[Keys["K_CRSEL"] = 247] = "K_CRSEL";
            Keys[Keys["K_EXSEL"] = 248] = "K_EXSEL";
            Keys[Keys["K_EREOF"] = 249] = "K_EREOF";
            Keys[Keys["K_PLAY"] = 250] = "K_PLAY";
            Keys[Keys["K_ZOOM"] = 251] = "K_ZOOM";
            Keys[Keys["K_PA1"] = 253] = "K_PA1";
            Keys[Keys["K_WIN_OEM_CLEAR"] = 254] = "K_WIN_OEM_CLEAR";
            Keys[Keys["M_LEFT"] = 0] = "M_LEFT";
            Keys[Keys["M_MID"] = 1] = "M_MID";
            Keys[Keys["M_RIGHT"] = 2] = "M_RIGHT";
            Keys[Keys["REGULAR"] = 255] = "REGULAR";
            Keys[Keys["SHIFT"] = 65280] = "SHIFT";
            Keys[Keys["CONTROL"] = 16711680] = "CONTROL";
        })(System.Keys || (System.Keys = {}));
        var Keys = System.Keys;
        class KeyMap {
        }
        KeyMap.KEYMAPLEN = 55;
        KeyMap.BACKSPACE = 8;
        KeyMap.DELETE = 127;
        KeyMap.SPACE = 32;
        KeyMap.data = new Array(Keys.K_1, '1', '!', Keys.K_2, '2', '@', Keys.K_3, '3', '#', Keys.K_4, '4', '$', Keys.K_5, '5', '%', Keys.K_6, '6', '^', Keys.K_7, '7', '&', Keys.K_8, '8', '*', Keys.K_9, '9', '(', Keys.K_0, '0', ')', Keys.K_MINUS, '-', '_', Keys.K_EQUAL, '=', '+', Keys.K_BACK_SPACE, String.fromCharCode(KeyMap.BACKSPACE), String.fromCharCode(KeyMap.BACKSPACE), Keys.K_TAB, '\t', '\t', Keys.K_Q, 'q', 'Q', Keys.K_W, 'w', 'W', Keys.K_E, 'e', 'E', Keys.K_R, 'r', 'R', Keys.K_T, 't', 'T', Keys.K_Y, 'y', 'Y', Keys.K_U, 'u', 'U', Keys.K_I, 'i', 'I', Keys.K_O, 'o', 'O', Keys.K_P, 'p', 'P', Keys.K_OPEN_BRACKET, '[', '', Keys.K_CLOSE_BRACKET, ']', '', Keys.K_ENTER, '\n', '\n', Keys.K_A, 'a', 'A', Keys.K_S, 's', 'S', Keys.K_D, 'd', 'D', Keys.K_F, 'f', 'F', Keys.K_G, 'g', 'G', Keys.K_H, 'h', 'H', Keys.K_J, 'j', 'J', Keys.K_K, 'k', 'K', Keys.K_L, 'l', 'L', Keys.K_SEMICOLON2, ';', ':', Keys.K_QUOTE, "'", '"', Keys.K_BACK_QUOTE, '`', '~', Keys.K_BACK_SLASH, '\\', '|', Keys.K_Z, 'z', 'Z', Keys.K_X, 'x', 'X', Keys.K_C, 'c', 'C', Keys.K_V, 'v', 'V', Keys.K_B, 'b', 'B', Keys.K_N, 'n', 'N', Keys.K_M, 'm', 'M', Keys.K_COMMA, ',', '<', Keys.K_PERIOD, '.', '>', Keys.K_SLASH, '/', '?', Keys.K_MULTIPLY, '*', '*', Keys.K_SPACE, ' ', ' ', Keys.K_SUBTRACT, '-', '-', Keys.K_ADD, '+', '+', Keys.K_DELETE, String.fromCharCode(KeyMap.DELETE), String.fromCharCode(KeyMap.DELETE));
        System.KeyMap = KeyMap;
    })(System = ExprAE.System || (ExprAE.System = {}));
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    var Libraries;
    (function (Libraries) {
        class Images {
            constructor(graph) {
                this.graph = graph;
                this.images = [];
                this.funclist = new Array(new ExprAE.Expressions.ELEMENT("TEX_LOAD", this.loadImageTex, ExprAE.Expressions.CLib.VAL_FLOAT, 1, ExprAE.Expressions.CLib.VAL_FLOAT, 0, this), new ExprAE.Expressions.ELEMENT("IMG_LOAD", this.loadImage, ExprAE.Expressions.CLib.VAL_FLOAT, 1, ExprAE.Expressions.CLib.VAL_FLOAT, 0, this), new ExprAE.Expressions.ELEMENT("IMG_PEEK", this.peek, ExprAE.Expressions.CLib.VAL_FLOAT, 3, 0, 0, this));
            }
            init(lib) {
                lib.addList(this.funclist);
                return lib;
            }
            loadImageBase(done, numberOfImage = 0) {
                var th = this;
                const fileUpload = "fileUpload";
                var existing = document.getElementById(fileUpload);
                if (existing) {
                    if (numberOfImage == -1) {
                        existing.remove();
                        return "Selector closed";
                    }
                    return "Selector is opened. Set argument to -1 for closing it.";
                }
                if (numberOfImage < 0) {
                    return "Argument must be positive";
                }
                var input = document.createElement('input');
                input.id = fileUpload;
                input.type = "file";
                document.getElementsByTagName('body')[0].appendChild(input);
                input.onchange = function (ev) {
                    var f = ev.target.files[0];
                    var fr = new FileReader();
                    fr.onload = function (ev2) {
                        var image = new Image();
                        image.onload = function () {
                            var t = this;
                            var w = t.width;
                            var h = t.width;
                            var canvas = document.createElement("canvas");
                            canvas.width = w;
                            canvas.height = h;
                            var ctx = canvas.getContext("2d");
                            ctx.drawImage(t, 0, 0);
                            var data = ctx.getImageData(0, 0, w, h);
                            done(data);
                            var toRemove = document.getElementById(fileUpload);
                            if (toRemove) {
                                toRemove.remove();
                            }
                            th.images[numberOfImage] = data;
                        };
                        image.src = ev2.target.result;
                    };
                    fr.readAsDataURL(f);
                };
                return "Select texture";
            }
            loadImageTex(numberOfFunc) {
                var th = this;
                return this.loadImageBase((data) => {
                    var tex = new ExprAE.Drawing.CTex();
                    tex.Load(new Uint8Array(data.data.buffer), data.width, data.height);
                    th.graph.loadTex(numberOfFunc, tex);
                }, numberOfFunc);
            }
            loadImage(numberOfImage) {
                return this.loadImageBase((data) => { }, numberOfImage);
            }
            peek(numberOfImage, x, y) {
                var img = this.images[numberOfImage];
                if (x < 0 || y < 0 || x >= img.width || y >= img.height)
                    return 0;
                var pos = ((x | 0) + (y | 0) * img.width) << 2;
                return (img.data[pos] + img.data[pos + 1] + img.data[pos + 2]) * 0.001302083;
            }
        }
        Libraries.Images = Images;
    })(Libraries = ExprAE.Libraries || (ExprAE.Libraries = {}));
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    class BiosFont {
    }
    BiosFont.data = new Array(0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7E, 0x81, 0xA5, 0x81, 0xBD, 0x99, 0x81, 0x7E, 0x7E, 0xFF, 0xDB, 0xFF, 0xC3, 0xE7, 0xFF, 0x7E, 0x6C, 0xFE, 0xFE, 0xFE, 0x7C, 0x38, 0x10, 0x00, 0x10, 0x38, 0x7C, 0xFE, 0x7C, 0x38, 0x10, 0x00, 0x38, 0x7C, 0x38, 0xFE, 0xFE, 0x7C, 0x38, 0x7C, 0x10, 0x10, 0x38, 0x7C, 0xFE, 0x7C, 0x38, 0x7C, 0x00, 0x00, 0x18, 0x3C, 0x3C, 0x18, 0x00, 0x00, 0xFF, 0xFF, 0xE7, 0xC3, 0xC3, 0xE7, 0xFF, 0xFF, 0x00, 0x3C, 0x66, 0x42, 0x42, 0x66, 0x3C, 0x00, 0xFF, 0xC3, 0x99, 0xBD, 0xBD, 0x99, 0xC3, 0xFF, 0x0F, 0x07, 0x0F, 0x7D, 0xCC, 0xCC, 0xCC, 0x78, 0x3C, 0x66, 0x66, 0x66, 0x3C, 0x18, 0x7E, 0x18, 0x3F, 0x33, 0x3F, 0x30, 0x30, 0x70, 0xF0, 0xE0, 0x7F, 0x63, 0x7F, 0x63, 0x63, 0x67, 0xE6, 0xC0, 0x99, 0x5A, 0x3C, 0xE7, 0xE7, 0x3C, 0x5A, 0x99, 0x80, 0xE0, 0xF8, 0xFE, 0xF8, 0xE0, 0x80, 0x00, 0x02, 0x0E, 0x3E, 0xFE, 0x3E, 0x0E, 0x02, 0x00, 0x18, 0x3C, 0x7E, 0x18, 0x18, 0x7E, 0x3C, 0x18, 0x66, 0x66, 0x66, 0x66, 0x66, 0x00, 0x66, 0x00, 0x7F, 0xDB, 0xDB, 0x7B, 0x1B, 0x1B, 0x1B, 0x00, 0x3E, 0x63, 0x38, 0x6C, 0x6C, 0x38, 0xCC, 0x78, 0x00, 0x00, 0x00, 0x00, 0x7E, 0x7E, 0x7E, 0x00, 0x18, 0x3C, 0x7E, 0x18, 0x7E, 0x3C, 0x18, 0xFF, 0x18, 0x3C, 0x7E, 0x18, 0x18, 0x18, 0x18, 0x00, 0x18, 0x18, 0x18, 0x18, 0x7E, 0x3C, 0x18, 0x00, 0x00, 0x18, 0x0C, 0xFE, 0x0C, 0x18, 0x00, 0x00, 0x00, 0x30, 0x60, 0xFE, 0x60, 0x30, 0x00, 0x00, 0x00, 0x00, 0xC0, 0xC0, 0xC0, 0xFE, 0x00, 0x00, 0x00, 0x24, 0x66, 0xFF, 0x66, 0x24, 0x00, 0x00, 0x00, 0x18, 0x3C, 0x7E, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x7E, 0x3C, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x78, 0x78, 0x30, 0x30, 0x00, 0x30, 0x00, 0x6C, 0x6C, 0x6C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x6C, 0x6C, 0xFE, 0x6C, 0xFE, 0x6C, 0x6C, 0x00, 0x30, 0x7C, 0xC0, 0x78, 0x0C, 0xF8, 0x30, 0x00, 0x00, 0xC6, 0xCC, 0x18, 0x30, 0x66, 0xC6, 0x00, 0x38, 0x6C, 0x38, 0x76, 0xDC, 0xCC, 0x76, 0x00, 0x60, 0x60, 0xC0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x30, 0x60, 0x60, 0x60, 0x30, 0x18, 0x00, 0x60, 0x30, 0x18, 0x18, 0x18, 0x30, 0x60, 0x00, 0x00, 0x66, 0x3C, 0xFF, 0x3C, 0x66, 0x00, 0x00, 0x00, 0x30, 0x30, 0xFC, 0x30, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x30, 0x60, 0x00, 0x00, 0x00, 0xFC, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x30, 0x00, 0x06, 0x0C, 0x18, 0x30, 0x60, 0xC0, 0x80, 0x00, 0x7C, 0xC6, 0xCE, 0xDE, 0xF6, 0xE6, 0x7C, 0x00, 0x30, 0x70, 0x30, 0x30, 0x30, 0x30, 0xFC, 0x00, 0x78, 0xCC, 0x0C, 0x38, 0x60, 0xCC, 0xFC, 0x00, 0x78, 0xCC, 0x0C, 0x38, 0x0C, 0xCC, 0x78, 0x00, 0x1C, 0x3C, 0x6C, 0xCC, 0xFE, 0x0C, 0x1E, 0x00, 0xFC, 0xC0, 0xF8, 0x0C, 0x0C, 0xCC, 0x78, 0x00, 0x38, 0x60, 0xC0, 0xF8, 0xCC, 0xCC, 0x78, 0x00, 0xFC, 0xCC, 0x0C, 0x18, 0x30, 0x30, 0x30, 0x00, 0x78, 0xCC, 0xCC, 0x78, 0xCC, 0xCC, 0x78, 0x00, 0x78, 0xCC, 0xCC, 0x7C, 0x0C, 0x18, 0x70, 0x00, 0x00, 0x30, 0x30, 0x00, 0x00, 0x30, 0x30, 0x00, 0x00, 0x30, 0x30, 0x00, 0x00, 0x30, 0x30, 0x60, 0x18, 0x30, 0x60, 0xC0, 0x60, 0x30, 0x18, 0x00, 0x00, 0x00, 0xFC, 0x00, 0x00, 0xFC, 0x00, 0x00, 0x60, 0x30, 0x18, 0x0C, 0x18, 0x30, 0x60, 0x00, 0x78, 0xCC, 0x0C, 0x18, 0x30, 0x00, 0x30, 0x00, 0x7C, 0xC6, 0xDE, 0xDE, 0xDE, 0xC0, 0x78, 0x00, 0x30, 0x78, 0xCC, 0xCC, 0xFC, 0xCC, 0xCC, 0x00, 0xFC, 0x66, 0x66, 0x7C, 0x66, 0x66, 0xFC, 0x00, 0x3C, 0x66, 0xC0, 0xC0, 0xC0, 0x66, 0x3C, 0x00, 0xF8, 0x6C, 0x66, 0x66, 0x66, 0x6C, 0xF8, 0x00, 0xFE, 0x62, 0x68, 0x78, 0x68, 0x62, 0xFE, 0x00, 0xFE, 0x62, 0x68, 0x78, 0x68, 0x60, 0xF0, 0x00, 0x3C, 0x66, 0xC0, 0xC0, 0xCE, 0x66, 0x3E, 0x00, 0xCC, 0xCC, 0xCC, 0xFC, 0xCC, 0xCC, 0xCC, 0x00, 0x78, 0x30, 0x30, 0x30, 0x30, 0x30, 0x78, 0x00, 0x1E, 0x0C, 0x0C, 0x0C, 0xCC, 0xCC, 0x78, 0x00, 0xE6, 0x66, 0x6C, 0x78, 0x6C, 0x66, 0xE6, 0x00, 0xF0, 0x60, 0x60, 0x60, 0x62, 0x66, 0xFE, 0x00, 0xC6, 0xEE, 0xFE, 0xFE, 0xD6, 0xC6, 0xC6, 0x00, 0xC6, 0xE6, 0xF6, 0xDE, 0xCE, 0xC6, 0xC6, 0x00, 0x38, 0x6C, 0xC6, 0xC6, 0xC6, 0x6C, 0x38, 0x00, 0xFC, 0x66, 0x66, 0x7C, 0x60, 0x60, 0xF0, 0x00, 0x78, 0xCC, 0xCC, 0xCC, 0xDC, 0x78, 0x1C, 0x00, 0xFC, 0x66, 0x66, 0x7C, 0x6C, 0x66, 0xE6, 0x00, 0x78, 0xCC, 0xE0, 0x70, 0x1C, 0xCC, 0x78, 0x00, 0xFC, 0xB4, 0x30, 0x30, 0x30, 0x30, 0x78, 0x00, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xFC, 0x00, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0x78, 0x30, 0x00, 0xC6, 0xC6, 0xC6, 0xD6, 0xFE, 0xEE, 0xC6, 0x00, 0xC6, 0xC6, 0x6C, 0x38, 0x38, 0x6C, 0xC6, 0x00, 0xCC, 0xCC, 0xCC, 0x78, 0x30, 0x30, 0x78, 0x00, 0xFE, 0xC6, 0x8C, 0x18, 0x32, 0x66, 0xFE, 0x00, 0x78, 0x60, 0x60, 0x60, 0x60, 0x60, 0x78, 0x00, 0xC0, 0x60, 0x30, 0x18, 0x0C, 0x06, 0x02, 0x00, 0x78, 0x18, 0x18, 0x18, 0x18, 0x18, 0x78, 0x00, 0x10, 0x38, 0x6C, 0xC6, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x30, 0x30, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x78, 0x0C, 0x7C, 0xCC, 0x76, 0x00, 0xE0, 0x60, 0x60, 0x7C, 0x66, 0x66, 0xDC, 0x00, 0x00, 0x00, 0x78, 0xCC, 0xC0, 0xCC, 0x78, 0x00, 0x1C, 0x0C, 0x0C, 0x7C, 0xCC, 0xCC, 0x76, 0x00, 0x00, 0x00, 0x78, 0xCC, 0xFC, 0xC0, 0x78, 0x00, 0x38, 0x6C, 0x60, 0xF0, 0x60, 0x60, 0xF0, 0x00, 0x00, 0x00, 0x76, 0xCC, 0xCC, 0x7C, 0x0C, 0xF8, 0xE0, 0x60, 0x6C, 0x76, 0x66, 0x66, 0xE6, 0x00, 0x30, 0x00, 0x70, 0x30, 0x30, 0x30, 0x78, 0x00, 0x0C, 0x00, 0x0C, 0x0C, 0x0C, 0xCC, 0xCC, 0x78, 0xE0, 0x60, 0x66, 0x6C, 0x78, 0x6C, 0xE6, 0x00, 0x70, 0x30, 0x30, 0x30, 0x30, 0x30, 0x78, 0x00, 0x00, 0x00, 0xCC, 0xFE, 0xFE, 0xD6, 0xC6, 0x00, 0x00, 0x00, 0xF8, 0xCC, 0xCC, 0xCC, 0xCC, 0x00, 0x00, 0x00, 0x78, 0xCC, 0xCC, 0xCC, 0x78, 0x00, 0x00, 0x00, 0xDC, 0x66, 0x66, 0x7C, 0x60, 0xF0, 0x00, 0x00, 0x76, 0xCC, 0xCC, 0x7C, 0x0C, 0x1E, 0x00, 0x00, 0xDC, 0x76, 0x66, 0x60, 0xF0, 0x00, 0x00, 0x00, 0x7C, 0xC0, 0x78, 0x0C, 0xF8, 0x00, 0x10, 0x30, 0x7C, 0x30, 0x30, 0x34, 0x18, 0x00, 0x00, 0x00, 0xCC, 0xCC, 0xCC, 0xCC, 0x76, 0x00, 0x00, 0x00, 0xCC, 0xCC, 0xCC, 0x78, 0x30, 0x00, 0x00, 0x00, 0xC6, 0xD6, 0xFE, 0xFE, 0x6C, 0x00, 0x00, 0x00, 0xC6, 0x6C, 0x38, 0x6C, 0xC6, 0x00, 0x00, 0x00, 0xCC, 0xCC, 0xCC, 0x7C, 0x0C, 0xF8, 0x00, 0x00, 0xFC, 0x98, 0x30, 0x64, 0xFC, 0x00, 0x1C, 0x30, 0x30, 0xE0, 0x30, 0x30, 0x1C, 0x00, 0x18, 0x18, 0x18, 0x00, 0x18, 0x18, 0x18, 0x00, 0xE0, 0x30, 0x30, 0x1C, 0x30, 0x30, 0xE0, 0x00, 0x76, 0xDC, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x38, 0x6C, 0xC6, 0xC6, 0xFE, 0x00, 0x78, 0xCC, 0xC0, 0xCC, 0x78, 0x18, 0x0C, 0x78, 0x00, 0xCC, 0x00, 0xCC, 0xCC, 0xCC, 0x7E, 0x00, 0x1C, 0x00, 0x78, 0xCC, 0xFC, 0xC0, 0x78, 0x00, 0x7E, 0xC3, 0x3C, 0x06, 0x3E, 0x66, 0x3F, 0x00, 0xCC, 0x00, 0x78, 0x0C, 0x7C, 0xCC, 0x7E, 0x00, 0xE0, 0x00, 0x78, 0x0C, 0x7C, 0xCC, 0x7E, 0x00, 0x30, 0x30, 0x78, 0x0C, 0x7C, 0xCC, 0x7E, 0x00, 0x00, 0x00, 0x78, 0xC0, 0xC0, 0x78, 0x0C, 0x38, 0x7E, 0xC3, 0x3C, 0x66, 0x7E, 0x60, 0x3C, 0x00, 0xCC, 0x00, 0x78, 0xCC, 0xFC, 0xC0, 0x78, 0x00, 0xE0, 0x00, 0x78, 0xCC, 0xFC, 0xC0, 0x78, 0x00, 0xCC, 0x00, 0x70, 0x30, 0x30, 0x30, 0x78, 0x00, 0x7C, 0xC6, 0x38, 0x18, 0x18, 0x18, 0x3C, 0x00, 0xE0, 0x00, 0x70, 0x30, 0x30, 0x30, 0x78, 0x00, 0xC6, 0x38, 0x6C, 0xC6, 0xFE, 0xC6, 0xC6, 0x00, 0x30, 0x30, 0x00, 0x78, 0xCC, 0xFC, 0xCC, 0x00, 0x1C, 0x00, 0xFC, 0x60, 0x78, 0x60, 0xFC, 0x00, 0x00, 0x00, 0x7F, 0x0C, 0x7F, 0xCC, 0x7F, 0x00, 0x3E, 0x6C, 0xCC, 0xFE, 0xCC, 0xCC, 0xCE, 0x00, 0x78, 0xCC, 0x00, 0x78, 0xCC, 0xCC, 0x78, 0x00, 0x00, 0xCC, 0x00, 0x78, 0xCC, 0xCC, 0x78, 0x00, 0x00, 0xE0, 0x00, 0x78, 0xCC, 0xCC, 0x78, 0x00, 0x78, 0xCC, 0x00, 0xCC, 0xCC, 0xCC, 0x7E, 0x00, 0x00, 0xE0, 0x00, 0xCC, 0xCC, 0xCC, 0x7E, 0x00, 0x00, 0xCC, 0x00, 0xCC, 0xCC, 0x7C, 0x0C, 0xF8, 0xC3, 0x18, 0x3C, 0x66, 0x66, 0x3C, 0x18, 0x00, 0xCC, 0x00, 0xCC, 0xCC, 0xCC, 0xCC, 0x78, 0x00, 0x18, 0x18, 0x7E, 0xC0, 0xC0, 0x7E, 0x18, 0x18, 0x38, 0x6C, 0x64, 0xF0, 0x60, 0xE6, 0xFC, 0x00, 0xCC, 0xCC, 0x78, 0xFC, 0x30, 0xFC, 0x30, 0x30, 0xF8, 0xCC, 0xCC, 0xFA, 0xC6, 0xCF, 0xC6, 0xC7, 0x0E, 0x1B, 0x18, 0x3C, 0x18, 0x18, 0xD8, 0x70, 0x1C, 0x00, 0x78, 0x0C, 0x7C, 0xCC, 0x7E, 0x00, 0x38, 0x00, 0x70, 0x30, 0x30, 0x30, 0x78, 0x00, 0x00, 0x1C, 0x00, 0x78, 0xCC, 0xCC, 0x78, 0x00, 0x00, 0x1C, 0x00, 0xCC, 0xCC, 0xCC, 0x7E, 0x00, 0x00, 0xF8, 0x00, 0xF8, 0xCC, 0xCC, 0xCC, 0x00, 0xFC, 0x00, 0xCC, 0xEC, 0xFC, 0xDC, 0xCC, 0x00, 0x3C, 0x6C, 0x6C, 0x3E, 0x00, 0x7E, 0x00, 0x00, 0x38, 0x6C, 0x6C, 0x38, 0x00, 0x7C, 0x00, 0x00, 0x30, 0x00, 0x30, 0x60, 0xC0, 0xCC, 0x78, 0x00, 0x00, 0x00, 0x00, 0xFC, 0xC0, 0xC0, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFC, 0x0C, 0x0C, 0x00, 0x00, 0xC3, 0xC6, 0xCC, 0xDE, 0x33, 0x66, 0xCC, 0x0F, 0xC3, 0xC6, 0xCC, 0xDB, 0x37, 0x6F, 0xCF, 0x03, 0x18, 0x18, 0x00, 0x18, 0x18, 0x18, 0x18, 0x00, 0x00, 0x33, 0x66, 0xCC, 0x66, 0x33, 0x00, 0x00, 0x00, 0xCC, 0x66, 0x33, 0x66, 0xCC, 0x00, 0x00, 0x22, 0x88, 0x22, 0x88, 0x22, 0x88, 0x22, 0x88, 0x55, 0xAA, 0x55, 0xAA, 0x55, 0xAA, 0x55, 0xAA, 0xDB, 0x77, 0xDB, 0xEE, 0xDB, 0x77, 0xDB, 0xEE, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0xF8, 0x18, 0x18, 0x18, 0x18, 0x18, 0xF8, 0x18, 0xF8, 0x18, 0x18, 0x18, 0x36, 0x36, 0x36, 0x36, 0xF6, 0x36, 0x36, 0x36, 0x00, 0x00, 0x00, 0x00, 0xFE, 0x36, 0x36, 0x36, 0x00, 0x00, 0xF8, 0x18, 0xF8, 0x18, 0x18, 0x18, 0x36, 0x36, 0xF6, 0x06, 0xF6, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x00, 0x00, 0xFE, 0x06, 0xF6, 0x36, 0x36, 0x36, 0x36, 0x36, 0xF6, 0x06, 0xFE, 0x00, 0x00, 0x00, 0x36, 0x36, 0x36, 0x36, 0xFE, 0x00, 0x00, 0x00, 0x18, 0x18, 0xF8, 0x18, 0xF8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF8, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x1F, 0x00, 0x00, 0x00, 0x18, 0x18, 0x18, 0x18, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x1F, 0x18, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x18, 0x18, 0x18, 0x18, 0xFF, 0x18, 0x18, 0x18, 0x18, 0x18, 0x1F, 0x18, 0x1F, 0x18, 0x18, 0x18, 0x36, 0x36, 0x36, 0x36, 0x37, 0x36, 0x36, 0x36, 0x36, 0x36, 0x37, 0x30, 0x3F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3F, 0x30, 0x37, 0x36, 0x36, 0x36, 0x36, 0x36, 0xF7, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0xF7, 0x36, 0x36, 0x36, 0x36, 0x36, 0x37, 0x30, 0x37, 0x36, 0x36, 0x36, 0x00, 0x00, 0xFF, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x36, 0x36, 0xF7, 0x00, 0xF7, 0x36, 0x36, 0x36, 0x18, 0x18, 0xFF, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x36, 0x36, 0x36, 0x36, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0xFF, 0x18, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x3F, 0x00, 0x00, 0x00, 0x18, 0x18, 0x1F, 0x18, 0x1F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1F, 0x18, 0x1F, 0x18, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x3F, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0xFF, 0x36, 0x36, 0x36, 0x18, 0x18, 0xFF, 0x18, 0xFF, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0xF8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1F, 0x18, 0x18, 0x18, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x76, 0xDC, 0xC8, 0xDC, 0x76, 0x00, 0x00, 0x78, 0xCC, 0xF8, 0xCC, 0xF8, 0xC0, 0xC0, 0x00, 0xFC, 0xCC, 0xC0, 0xC0, 0xC0, 0xC0, 0x00, 0x00, 0xFE, 0x6C, 0x6C, 0x6C, 0x6C, 0x6C, 0x00, 0xFC, 0xCC, 0x60, 0x30, 0x60, 0xCC, 0xFC, 0x00, 0x00, 0x00, 0x7E, 0xD8, 0xD8, 0xD8, 0x70, 0x00, 0x00, 0x66, 0x66, 0x66, 0x66, 0x7C, 0x60, 0xC0, 0x00, 0x76, 0xDC, 0x18, 0x18, 0x18, 0x18, 0x00, 0xFC, 0x30, 0x78, 0xCC, 0xCC, 0x78, 0x30, 0xFC, 0x38, 0x6C, 0xC6, 0xFE, 0xC6, 0x6C, 0x38, 0x00, 0x38, 0x6C, 0xC6, 0xC6, 0x6C, 0x6C, 0xEE, 0x00, 0x1C, 0x30, 0x18, 0x7C, 0xCC, 0xCC, 0x78, 0x00, 0x00, 0x00, 0x7E, 0xDB, 0xDB, 0x7E, 0x00, 0x00, 0x06, 0x0C, 0x7E, 0xDB, 0xDB, 0x7E, 0x60, 0xC0, 0x38, 0x60, 0xC0, 0xF8, 0xC0, 0x60, 0x38, 0x00, 0x78, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0x00, 0x00, 0xFC, 0x00, 0xFC, 0x00, 0xFC, 0x00, 0x00, 0x30, 0x30, 0xFC, 0x30, 0x30, 0x00, 0xFC, 0x00, 0x60, 0x30, 0x18, 0x30, 0x60, 0x00, 0xFC, 0x00, 0x18, 0x30, 0x60, 0x30, 0x18, 0x00, 0xFC, 0x00, 0x0E, 0x1B, 0x1B, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0xD8, 0xD8, 0x70, 0x30, 0x30, 0x00, 0xFC, 0x00, 0x30, 0x30, 0x00, 0x00, 0x76, 0xDC, 0x00, 0x76, 0xDC, 0x00, 0x00, 0x38, 0x6C, 0x6C, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x00, 0x00, 0x00, 0x0F, 0x0C, 0x0C, 0x0C, 0xEC, 0x6C, 0x3C, 0x1C, 0x78, 0x6C, 0x6C, 0x6C, 0x6C, 0x00, 0x00, 0x00, 0x70, 0x18, 0x30, 0x60, 0x78, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3C, 0x3C, 0x3C, 0x3C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
    ExprAE.BiosFont = BiosFont;
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    var Drawing;
    (function (Drawing) {
        class CWin {
            constructor(width, height, buf) {
                this.width = width;
                this.height = height;
                this.buf = buf;
                this.fontwidth = 8;
                this.fontheight = 8;
            }
            GetBuf() {
                return this.buf;
            }
            KeyFunc(k) { }
            Process() { }
            Change(buf, width, height) {
                if (width)
                    this.width = width;
                if (height)
                    this.height = height;
                this.buf = buf;
            }
            ChangeActiveState(state) { }
            ChangeFontSize(w, h) {
                this.fontwidth = w;
                this.fontheight = h;
            }
            PutPixel(x, y, c) {
                if ((x < 0) || (y < 0) || (x >= this.width) || (y >= this.height))
                    return;
                ExprAE.D.SetBuf32(this.buf, this.width, x, y, c);
            }
            Line(x1, y1, x2, y2, col) {
                if ((((x1 < 0) && (x2 < 0)) || ((y1 < 0) && (y2 < 0))) ||
                    (((x1 >= this.width) && (x2 >= this.width)) || ((y1 >= this.height) && (y2 >= this.height))))
                    return;
                if (x1 == x2) {
                    this.VLine(x1, y1, y2, col);
                    return;
                }
                else if (y1 == y2) {
                    this.HLine(x1, y1, x2, col);
                    return;
                }
                if ((x1 < 0) || (x2 < 0) || (y1 < 0) || (y2 < 0) ||
                    (x1 >= this.width) || (x2 >= this.width) || (y1 >= this.height) || (y2 >= this.height)) {
                    var a, b;
                    a = ((y2 - y1) << CWin.FIXED_SHIFT) / (x1 - x2);
                    b = -(y1 << CWin.FIXED_SHIFT) - a * x1;
                    var left, right, top, bottom;
                    left = b >> CWin.FIXED_SHIFT;
                    right = (a * (this.width - 1) + b) >> CWin.FIXED_SHIFT;
                    if (a == 0)
                        a = 1;
                    top = (-b / a);
                    bottom = ((-((this.height - 1) << CWin.FIXED_SHIFT) - b) / a);
                    var ok = 0;
                    if ((left <= 0) && (left >= -this.height + 1)) {
                        if (x1 < 0) {
                            x1 = 0;
                            y1 = -left;
                        }
                        else if (x2 < 0) {
                            x2 = 0;
                            y2 = -left;
                        }
                        ok = 1;
                    }
                    if ((right <= 0) && (right >= -this.height + 1)) {
                        if (x1 >= this.width) {
                            x1 = this.width - 1;
                            y1 = -right;
                        }
                        else if (x2 >= this.width) {
                            x2 = this.width - 1;
                            y2 = -right;
                        }
                        ok = 1;
                    }
                    if ((top >= 0) && (top < this.width)) {
                        if (y1 < 0) {
                            x1 = top;
                            y1 = 0;
                        }
                        else if (y2 < 0) {
                            x2 = top;
                            y2 = 0;
                        }
                        ok = 1;
                    }
                    if ((bottom >= 0) && (bottom < this.width)) {
                        if (y1 >= this.height) {
                            x1 = bottom;
                            y1 = this.height - 1;
                        }
                        else if (y2 >= this.height) {
                            x2 = bottom;
                            y2 = this.height - 1;
                        }
                        ok = 1;
                    }
                    if (ok == 0)
                        return;
                    if ((x1 < 0) || (x2 < 0) || (y1 < 0) || (y2 < 0) ||
                        (x1 >= this.width) || (x2 >= this.width) || (y1 >= this.height) || (y2 >= this.height))
                        return;
                }
                var sx = x2 - x1, sy = y2 - y1;
                var dx1, dy1, dx2, dy2;
                if (sx > 0)
                    dx1 = 1;
                else if (sx < 0)
                    dx1 = -1;
                else
                    dx1 = 0;
                if (sy > 0)
                    dy1 = 1;
                else if (sy < 0)
                    dy1 = -1;
                else
                    dy1 = 0;
                a = Math.abs(sx);
                b = Math.abs(sy);
                if (a > b) {
                    dx2 = dx1;
                    dy2 = 0;
                }
                else {
                    dx2 = 0;
                    dy2 = dy1;
                    var pom = a;
                    a = b;
                    b = pom;
                }
                var s = a / 2;
                var dwsk1 = dx1 + dy1 * this.width, dwsk2 = dx2 + dy2 * this.width;
                var wsk = (y1 | 0) * this.width + (x1 | 0);
                for (var i = 0; i <= a; i++) {
                    this.buf[wsk] = col;
                    s += b;
                    if (s >= a) {
                        s -= a;
                        wsk += dwsk1;
                    }
                    else {
                        wsk += dwsk2;
                    }
                }
            }
            HLine(x1, y, x2, col) {
                if ((y < 0) || (y >= this.height))
                    return;
                if (x1 > x2) {
                    var pom = x1;
                    x1 = x2;
                    x2 = pom;
                }
                if (x1 < 0)
                    x1 = 0;
                if (x2 >= this.width)
                    x2 = this.width - 1;
                if (x2 - x1 + 1 <= 0)
                    return;
                var pos0 = (x1 | 0) + (y | 0) * this.width;
                this.buf.fill(col, pos0, pos0 + (x2 | 0) - (x1 | 0) + 1);
            }
            VLine(x, y1, y2, col) {
                if ((x < 0) || (x >= this.width))
                    return;
                if (y1 > y2) {
                    var pom = y1;
                    y1 = y2;
                    y2 = pom;
                }
                if (y1 < 0)
                    y1 = 0;
                if (y2 >= this.height)
                    y2 = this.height - 1;
                var i = (y2 | 0) - (y1 | 0) + 1;
                if (i <= 0)
                    return;
                var bf = (x | 0) + (y1 | 0) * this.width;
                while (i-- > 0) {
                    this.buf[bf] = col;
                    bf += this.width;
                }
            }
            Bar(x1, y1, x2, y2, col) {
                if (y1 > y2) {
                    var pom = y1;
                    y1 = y2;
                    y2 = pom;
                }
                if (y1 < 0)
                    y1 = 0;
                if (y2 >= this.height)
                    y2 = this.height - 1;
                if (x1 > x2) {
                    var pom = x1;
                    x1 = x2;
                    x2 = pom;
                }
                if (x1 < 0)
                    x1 = 0;
                if (x2 >= this.width)
                    x2 = this.width - 1;
                if (x2 - x1 + 1 <= 0)
                    return;
                var i = (y2 | 0) - (y1 | 0) + 1;
                if (i <= 0)
                    return;
                var d = (x2 | 0) - (x1 | 0) + 1;
                var b = (x1 | 0) + (y1 | 0) * this.width;
                while (i-- > 0) {
                    this.buf.fill(col, b, b + d);
                    b += this.width;
                }
            }
            DrawChar8X8(x, y, pal, c) {
                if (y <= -8)
                    return;
                if (y >= this.height)
                    return;
                if (x <= -8)
                    return;
                if (x >= this.width)
                    return;
                var w = 8, h = 8, sw = 0, sh = 0;
                if (x < 0) {
                    sw = -x;
                    x = 0;
                }
                if (x > this.width - 8)
                    w -= x - (this.width - 8);
                if (y < 0) {
                    sh = -y;
                    y = 0;
                }
                if (y > this.height - 8)
                    h -= y - (this.height - 8);
                var d = (w - sw) | 0;
                var wsk = (y | 0) * this.width + (x | 0);
                for (var j = sh; j < h; j++) {
                    var line = ExprAE.BiosFont.data[c * 8 + j];
                    for (var i = sw; i < w; i++) {
                        if (((line >> (7 - i)) & 0x1) == 1)
                            this.buf[wsk] = pal[j * 8 + i];
                        wsk++;
                    }
                    wsk += this.width - d;
                }
            }
            DrawChar8X16(x, y, pal, c) {
                if (y <= -16)
                    return;
                if (y >= this.height)
                    return;
                if (x <= -8)
                    return;
                if (x >= this.width)
                    return;
                var w = 8, h = 16, sw = 0, sh = 0;
                if (x < 0) {
                    sw = -x;
                    x = 0;
                }
                if (x > this.width - 8)
                    w -= x - (this.width - 8);
                if (y < 0) {
                    sh = -y;
                    y = 0;
                }
                if (y > this.height - 16)
                    h -= y - (this.height - 16);
                var d = w - sw;
                var wsk = (y | 0) * this.width + (x | 0);
                for (var j = sh; j < h; j++) {
                    var line = ExprAE.BiosFont8x16.data[c * 16 + j];
                    for (var i = sw; i < w; i++) {
                        if (((line >> (7 - i)) & 0x1) == 1)
                            this.buf[wsk] = pal[j * 8 + i];
                        wsk++;
                    }
                    wsk += this.width - d;
                }
            }
            DrawText(x, y, color, s) {
                if (!s)
                    return;
                var pal = [];
                var ch;
                if (this.fontheight < 16)
                    ch = 8;
                else
                    ch = 16;
                var d = ((CWin.TEXT_FADE2 - CWin.TEXT_FADE1) << CWin.FIXED_SHIFT) / ch;
                var d2 = (CWin.TEXT_FADEL << CWin.FIXED_SHIFT) / ch;
                var f = CWin.TEXT_FADE1 << CWin.FIXED_SHIFT;
                for (var j = 0; j < ch; j++) {
                    var cf = f;
                    for (var i = 0; i < 8; i++) {
                        pal[j * 8 + i] = this.FadeColor(color, cf >> CWin.FIXED_SHIFT);
                        cf += d2;
                        if (cf > (255 << CWin.FIXED_SHIFT))
                            cf = (255 << CWin.FIXED_SHIFT);
                    }
                    f += d;
                }
                for (var i = 0; i < s.length; i++) {
                    if (this.fontheight < 16)
                        this.DrawChar8X8(x, y, pal, s.charCodeAt(i));
                    else
                        this.DrawChar8X16(x, y, pal, s.charCodeAt(i));
                    x += this.fontwidth;
                }
            }
            DrawTextHighlighted(x, y, color, fade, s) {
                if (!s)
                    return;
                var pal = [];
                var ch;
                if (this.fontheight < 16)
                    ch = 8;
                else
                    ch = 16;
                for (var k = 0; k <= ExprAE.System.CSys.Color.length; k++) {
                    pal[k] = [];
                    var d = (CWin.TEXT_FADE2 - CWin.TEXT_FADE1) / ch;
                    var d2 = CWin.TEXT_FADEL / ch;
                    var f = CWin.TEXT_FADE1;
                    var col;
                    if (k < ExprAE.System.CSys.Color.length)
                        col = this.FadeColor(ExprAE.System.CSys.Color[k], fade);
                    else
                        col = this.FadeColor(color, fade);
                    for (var j = 0; j < ch; j++) {
                        var cf = f;
                        for (var i = 0; i < 8; i++) {
                            pal[k][j * 8 + i] = this.FadeColor(col, cf);
                            cf += d2;
                            if (cf > 255)
                                cf = 255;
                        }
                        f += d;
                    }
                }
                var palno = ExprAE.System.CSys.Color.length;
                var fcol = 0;
                var num = 0;
                var txt = 0;
                var bsl = 0;
                for (var i = 0; i < s.length; i++) {
                    var c = s[i];
                    if (fcol == 0) {
                        if (c == '\\')
                            bsl = 1 - bsl;
                        else if ((c == '"') || (c == '\'')) {
                            if (bsl == 0)
                                txt = 1 - txt;
                            bsl = 0;
                            palno = ExprAE.System.CSys.CTxt;
                        }
                        else if (txt == 0) {
                            if (c == '$')
                                num = 1;
                            else if ((c >= '0') && (c <= '9'))
                                palno = ExprAE.System.CSys.CNum;
                            else if (((c >= 'A') && (c <= 'Z')) || ((c >= 'a') && (c <= 'z')))
                                palno = ExprAE.System.CSys.Color.length;
                            else {
                                palno = ExprAE.System.CSys.COp;
                                num = 0;
                            }
                            if (num)
                                palno = ExprAE.System.CSys.CNum;
                        }
                        else
                            bsl = 0;
                    }
                    if (c.charCodeAt(0) <= ExprAE.System.CSys.Color.length) {
                        palno = c.charCodeAt(0) - 1;
                        fcol = 1;
                        continue;
                    }
                    if (this.fontheight < 16)
                        this.DrawChar8X8(x, y, pal[palno], s.charCodeAt(i));
                    else
                        this.DrawChar8X16(x, y, pal[palno], s.charCodeAt(i));
                    x += this.fontwidth;
                }
            }
            DrawText3X5(x, y, color, s) {
                if (y + 5 > this.height)
                    return;
                if (y < 0)
                    return;
                var cont = 0;
                x = (x | 0);
                var wsk = (y | 0) * this.width + x;
                for (var k = 0; k < s.length; k++) {
                    if (x >= this.width - 4)
                        return;
                    if (x < 0) {
                        x += 4;
                        wsk += 4;
                        continue;
                    }
                    var c = s.charCodeAt(k);
                    if ((c <= ' '.charCodeAt(0)) || (c > '}'.charCodeAt(0))) {
                        x += 4;
                        wsk += 4;
                        continue;
                    }
                    if ((c == '&'.charCodeAt(0)) || (c == '|'.charCodeAt(0))) {
                        cont = 1 - cont;
                        if (cont == 0) {
                            continue;
                        }
                    }
                    else
                        cont = 0;
                    if ((c >= 'a'.charCodeAt(0)) && (c <= 'z'.charCodeAt(0)))
                        c -= 'a'.charCodeAt(0) - 'A'.charCodeAt(0);
                    if ((c >= '{'.charCodeAt(0)) && (c <= '}'.charCodeAt(0)))
                        c -= 'z'.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
                    c -= ' '.charCodeAt(0) + 1;
                    for (var j = 0; j < 5; j++) {
                        for (var i = 0; i < 3; i++) {
                            if (ExprAE.Font3x5.data[c * 3 * 5 + j * 3 + i] == 1)
                                this.buf[wsk] = color;
                            wsk++;
                        }
                        wsk += this.width - 3;
                    }
                    wsk -= this.width * 5 - 4;
                    x += 4;
                }
            }
            GTriangle_z(xa, ya, xb, yb, xc, yc, ca, cb, cc, pal, z, zbuf) {
                var left = 0, top = 0, right = this.width - 1, bottom = this.height - 1;
                if (((xa < left) && (xb < left) && (xc < left)) || ((ya < top) && (yb < top) && (yc < top)) ||
                    ((xa > right) && (xb > right) && (xc > right)) || ((ya > bottom) && (yb > bottom) && (yc > bottom)))
                    return;
                var x1;
                var y1;
                var x2;
                var y2;
                var x3;
                var y3;
                var c1;
                var c2;
                var c3;
                var part = 0;
                var disp1 = 0, disp2 = 0;
                var _y1;
                var _y2;
                var _y3;
                if (ya <= yb) {
                    if (yb <= yc) {
                        x1 = xa;
                        y1 = ya;
                        x2 = xb;
                        y2 = yb;
                        x3 = xc;
                        y3 = yc;
                        c1 = ca;
                        c2 = cb;
                        c3 = cc;
                    }
                    else if (ya <= yc) {
                        x1 = xa;
                        y1 = ya;
                        x2 = xc;
                        y2 = yc;
                        x3 = xb;
                        y3 = yb;
                        c1 = ca;
                        c2 = cc;
                        c3 = cb;
                    }
                    else {
                        x1 = xc;
                        y1 = yc;
                        x2 = xa;
                        y2 = ya;
                        x3 = xb;
                        y3 = yb;
                        c1 = cc;
                        c2 = ca;
                        c3 = cb;
                    }
                }
                else {
                    if (ya <= yc) {
                        x1 = xb;
                        y1 = yb;
                        x2 = xa;
                        y2 = ya;
                        x3 = xc;
                        y3 = yc;
                        c1 = cb;
                        c2 = ca;
                        c3 = cc;
                    }
                    else if (yb <= yc) {
                        x1 = xb;
                        y1 = yb;
                        x2 = xc;
                        y2 = yc;
                        x3 = xa;
                        y3 = ya;
                        c1 = cb;
                        c2 = cc;
                        c3 = ca;
                    }
                    else {
                        x1 = xc;
                        y1 = yc;
                        x2 = xb;
                        y2 = yb;
                        x3 = xa;
                        y3 = ya;
                        c1 = cc;
                        c2 = cb;
                        c3 = ca;
                    }
                }
                if (y1 == y2) {
                    if (x1 > x2) {
                        var pom = x2;
                        x2 = x1;
                        x1 = pom;
                        pom = c2;
                        c2 = c1;
                        c1 = pom;
                    }
                    part = 2;
                }
                if (y2 == y3) {
                    if (x2 > x3) {
                        var pom = x3;
                        x3 = x2;
                        x2 = pom;
                        pom = c3;
                        c3 = c2;
                        c2 = pom;
                    }
                    part |= 1;
                }
                if (part == 3)
                    return;
                if ((y1 < top) && (y2 >= top)) {
                    disp1 = top - y1;
                    _y1 = top;
                    _y2 = y2;
                }
                else if ((y1 < top) && (y2 < top)) {
                    part = 2;
                    disp1 = top - y1;
                    disp2 = top - y2;
                    _y1 = top;
                    _y2 = top;
                }
                else {
                    _y1 = y1;
                    _y2 = y2;
                }
                if ((y1 <= bottom) && (y2 > bottom)) {
                    part = 1;
                    _y2 = bottom;
                    _y3 = y3;
                }
                else if ((y1 <= bottom) && (y2 <= bottom) && (y3 > bottom)) {
                    _y3 = bottom;
                }
                else {
                    _y3 = y3;
                }
                var i;
                var y;
                var d12;
                var d13;
                var d23;
                var xA;
                var xB;
                var dc12;
                var dc13;
                var dc23;
                var cA;
                var cB;
                var wsk;
                var zwsk;
                if (part != 2) {
                    d12 = ((x2 - x1)) / (y2 - y1);
                    d13 = ((x3 - x1)) / (y3 - y1);
                    dc12 = ((c2 - c1)) / (y2 - y1);
                    dc13 = ((c3 - c1)) / (y3 - y1);
                    if (d12 > d13) {
                        var pom = d12;
                        d12 = d13;
                        d13 = pom;
                        pom = dc12;
                        dc12 = dc13;
                        dc13 = pom;
                    }
                    xA = (x1) + disp1 * d12;
                    xB = (x1) + disp1 * d13;
                    cA = (c1) + disp1 * dc12;
                    cB = (c1) + disp1 * dc13;
                    y = _y1;
                    while (y <= _y2) {
                        var _xA = (xA);
                        var _xB = (xB);
                        var disp;
                        if (!(_xA > right || _xB < left)) {
                            disp = 0;
                            if (_xA < left) {
                                disp = left - _xA;
                                _xA = left;
                            }
                            if (_xB > right)
                                _xB = right;
                            i = _xB - _xA + 1;
                            wsk = (_xA | 0) + (y | 0) * this.width;
                            zwsk = (_xA | 0) + (y | 0) * this.width;
                            var dc = ((cB - cA)) / (xB - xA + (1));
                            var c = cA + disp * dc;
                            while (i-- > 0) {
                                if (z < zbuf[zwsk]) {
                                    this.buf[wsk] = pal[(c | 0)];
                                    zbuf[zwsk] = z;
                                }
                                wsk++;
                                zwsk++;
                                c += dc;
                            }
                        }
                        xA += d12;
                        xB += d13;
                        cA += dc12;
                        cB += dc13;
                        y++;
                    }
                    if (part == 1)
                        return;
                }
                d23 = ((x3 - x2)) / (y3 - y2);
                d13 = ((x3 - x1)) / (y3 - y1);
                dc23 = ((c3 - c2)) / (y3 - y2);
                dc13 = ((c3 - c1)) / (y3 - y1);
                xA = (x2) + disp2 * d23;
                xB = (x1) + (_y2 - y1) * d13;
                cA = (c2) + disp2 * dc23;
                cB = (c1) + (_y2 - y1) * dc13;
                if (xA > xB) {
                    var pom = d23;
                    d23 = d13;
                    d13 = pom;
                    pom = xB;
                    xB = xA;
                    xA = pom;
                    pom = dc23;
                    dc23 = dc13;
                    dc13 = pom;
                    pom = cB;
                    cB = cA;
                    cA = pom;
                }
                y = _y2;
                while (y <= _y3) {
                    if (xB < xA)
                        xB = xA;
                    var _xA = (xA);
                    var _xB = (xB);
                    var disp;
                    if (!(_xA > right || _xB < left)) {
                        disp = 0;
                        if (_xA < left) {
                            disp = left - _xA;
                            _xA = left;
                        }
                        if (_xB > right)
                            _xB = right;
                        i = _xB - _xA + 1;
                        wsk = (_xA | 0) + (y | 0) * this.width;
                        zwsk = (_xA | 0) + (y | 0) * this.width;
                        var dc = ((cB - cA)) / (xB - xA + (1));
                        var c = cA + disp * dc;
                        while (i-- > 0) {
                            if (z < zbuf[zwsk]) {
                                this.buf[wsk] = pal[(c | 0)];
                                zbuf[zwsk] = z;
                            }
                            wsk++;
                            zwsk++;
                            c += dc;
                        }
                    }
                    xA += d23;
                    xB += d13;
                    cA += dc23;
                    cB += dc13;
                    y++;
                }
            }
            TTriangle_z(xa, ya, xb, yb, xc, yc, fua, fva, fub, fvb, fuc, fvc, tex, ca, cb, cc, z, zbuf) {
                var left = 0, top = 0, right = this.width - 1, bottom = this.height - 1;
                if (((xa < left) && (xb < left) && (xc < left)) || ((ya < top) && (yb < top) && (yc < top)) ||
                    ((xa > right) && (xb > right) && (xc > right)) || ((ya > bottom) && (yb > bottom) && (yc > bottom)))
                    return;
                var x1;
                var y1;
                var x2;
                var y2;
                var x3;
                var y3;
                var c1;
                var c2;
                var c3;
                var fu1;
                var fv1;
                var fu2;
                var fv2;
                var fu3;
                var fv3;
                var part = 0;
                var disp1 = 0, disp2 = 0;
                var _y1;
                var _y2;
                var _y3;
                if (ya <= yb) {
                    if (yb <= yc) {
                        x1 = xa;
                        y1 = ya;
                        x2 = xb;
                        y2 = yb;
                        x3 = xc;
                        y3 = yc;
                        c1 = ca;
                        c2 = cb;
                        c3 = cc;
                        fu1 = fua;
                        fv1 = fva;
                        fu2 = fub;
                        fv2 = fvb;
                        fu3 = fuc;
                        fv3 = fvc;
                    }
                    else if (ya <= yc) {
                        x1 = xa;
                        y1 = ya;
                        x2 = xc;
                        y2 = yc;
                        x3 = xb;
                        y3 = yb;
                        c1 = ca;
                        c2 = cc;
                        c3 = cb;
                        fu1 = fua;
                        fv1 = fva;
                        fu2 = fuc;
                        fv2 = fvc;
                        fu3 = fub;
                        fv3 = fvb;
                    }
                    else {
                        x1 = xc;
                        y1 = yc;
                        x2 = xa;
                        y2 = ya;
                        x3 = xb;
                        y3 = yb;
                        c1 = cc;
                        c2 = ca;
                        c3 = cb;
                        fu1 = fuc;
                        fv1 = fvc;
                        fu2 = fua;
                        fv2 = fva;
                        fu3 = fub;
                        fv3 = fvb;
                    }
                }
                else {
                    if (ya <= yc) {
                        x1 = xb;
                        y1 = yb;
                        x2 = xa;
                        y2 = ya;
                        x3 = xc;
                        y3 = yc;
                        c1 = cb;
                        c2 = ca;
                        c3 = cc;
                        fu1 = fub;
                        fv1 = fvb;
                        fu2 = fua;
                        fv2 = fva;
                        fu3 = fuc;
                        fv3 = fvc;
                    }
                    else if (yb <= yc) {
                        x1 = xb;
                        y1 = yb;
                        x2 = xc;
                        y2 = yc;
                        x3 = xa;
                        y3 = ya;
                        c1 = cb;
                        c2 = cc;
                        c3 = ca;
                        fu1 = fub;
                        fv1 = fvb;
                        fu2 = fuc;
                        fv2 = fvc;
                        fu3 = fua;
                        fv3 = fva;
                    }
                    else {
                        x1 = xc;
                        y1 = yc;
                        x2 = xb;
                        y2 = yb;
                        x3 = xa;
                        y3 = ya;
                        c1 = cc;
                        c2 = cb;
                        c3 = ca;
                        fu1 = fuc;
                        fv1 = fvc;
                        fu2 = fub;
                        fv2 = fvb;
                        fu3 = fua;
                        fv3 = fva;
                    }
                }
                if (y1 == y2) {
                    if (x1 > x2) {
                        var pom = x2;
                        x2 = x1;
                        x1 = pom;
                        pom = c2;
                        c2 = c1;
                        c1 = pom;
                        var fpom;
                        fpom = fu2;
                        fu2 = fu1;
                        fu1 = fpom;
                        fpom = fv2;
                        fv2 = fv1;
                        fv1 = fpom;
                    }
                    part = 2;
                }
                if (y2 == y3) {
                    if (x2 > x3) {
                        var pom = x3;
                        x3 = x2;
                        x2 = pom;
                        pom = c3;
                        c3 = c2;
                        c2 = pom;
                        var fpom;
                        fpom = fu3;
                        fu3 = fu2;
                        fu2 = fpom;
                        fpom = fv3;
                        fv3 = fv2;
                        fv2 = fpom;
                    }
                    part |= 1;
                }
                if (part == 3)
                    return;
                if ((y1 < top) && (y2 >= top)) {
                    disp1 = top - y1;
                    _y1 = top;
                    _y2 = y2;
                }
                else if ((y1 < top) && (y2 < top)) {
                    part = 2;
                    disp1 = top - y1;
                    disp2 = top - y2;
                    _y1 = top;
                    _y2 = top;
                }
                else {
                    _y1 = y1;
                    _y2 = y2;
                }
                if ((y1 <= bottom) && (y2 > bottom)) {
                    part = 1;
                    _y2 = bottom;
                    _y3 = y3;
                }
                else if ((y1 <= bottom) && (y2 <= bottom) && (y3 > bottom)) {
                    _y3 = bottom;
                }
                else {
                    _y3 = y3;
                }
                var i;
                var y;
                var d12;
                var d13;
                var d23;
                var xA;
                var xB;
                var dc12;
                var dc13;
                var dc23;
                var cA;
                var cB;
                var du12;
                var dv12;
                var du13;
                var dv13;
                var du23;
                var dv23;
                var uA;
                var vA;
                var uB;
                var vB;
                var wsk;
                var zwsk;
                var lev = 0;
                var fduy = Math.abs((fu3 - fu1) * tex.GetSize(0) / (y3 - y1));
                var fdvy = Math.abs((fv3 - fv1) * tex.GetSize(0) / (y3 - y1));
                var fdux;
                var fdvx;
                if ((xa <= xb) && (xb <= xc)) {
                    fdux = Math.abs((fuc - fua) * tex.GetSize(0) / (xc - xa));
                    fdvx = Math.abs((fvc - fva) * tex.GetSize(0) / (xc - xa));
                }
                else if ((xa <= xc) && (xc <= xb)) {
                    fdux = Math.abs((fub - fua) * tex.GetSize(0) / (xb - xa));
                    fdvx = Math.abs((fvb - fva) * tex.GetSize(0) / (xb - xa));
                }
                else if ((xb <= xa) && (xa <= xc)) {
                    fdux = Math.abs((fuc - fub) * tex.GetSize(0) / (xc - xb));
                    fdvx = Math.abs((fvc - fvb) * tex.GetSize(0) / (xc - xb));
                }
                else if ((xb <= xc) && (xc <= xa)) {
                    fdux = Math.abs((fua - fub) * tex.GetSize(0) / (xa - xb));
                    fdvx = Math.abs((fva - fvb) * tex.GetSize(0) / (xa - xb));
                }
                else if ((xc <= xa) && (xa <= xb)) {
                    fdux = Math.abs((fub - fuc) * tex.GetSize(0) / (xb - xc));
                    fdvx = Math.abs((fvb - fvc) * tex.GetSize(0) / (xb - xc));
                }
                else if ((xc <= xb) && (xb <= xa)) {
                    fdux = Math.abs((fua - fuc) * tex.GetSize(0) / (xa - xc));
                    fdvx = Math.abs((fva - fvc) * tex.GetSize(0) / (xa - xc));
                }
                var fdy = (fduy > fdvy) ? fduy : fdvy;
                var fdx = (fdux > fdvx) ? fdux : fdvx;
                var fd = (fdy > fdx) ? fdy : fdx;
                if (fd > 1) {
                    var l = 0;
                    while ((fd > 1) && (l < tex.GetMaxLev())) {
                        fd *= 0.5;
                        l++;
                    }
                    lev = l;
                }
                tex.SetPeekLev(lev);
                if (part != 2) {
                    d12 = ((x2 - x1)) / (y2 - y1);
                    d13 = ((x3 - x1)) / (y3 - y1);
                    dc12 = ((c2 - c1)) / (y2 - y1);
                    dc13 = ((c3 - c1)) / (y3 - y1);
                    du12 = Math.floor((fu2 - fu1) * tex.GetSize(lev)) / (y2 - y1);
                    dv12 = Math.floor((fv2 - fv1) * tex.GetSize(lev)) / (y2 - y1);
                    du13 = Math.floor((fu3 - fu1) * tex.GetSize(lev)) / (y3 - y1);
                    dv13 = Math.floor((fv3 - fv1) * tex.GetSize(lev)) / (y3 - y1);
                    if (d12 > d13) {
                        var pom = d12;
                        d12 = d13;
                        d13 = pom;
                        pom = dc12;
                        dc12 = dc13;
                        dc13 = pom;
                        pom = du12;
                        du12 = du13;
                        du13 = pom;
                        pom = dv12;
                        dv12 = dv13;
                        dv13 = pom;
                    }
                    xA = (x1) + disp1 * d12;
                    xB = (x1) + disp1 * d13;
                    cA = (c1) + disp1 * dc12;
                    cB = (c1) + disp1 * dc13;
                    uA = ((Math.floor(fu1 * tex.GetSize(lev)))) + disp1 * du12;
                    vA = ((Math.floor(fv1 * tex.GetSize(lev)))) + disp1 * dv12;
                    uB = ((Math.floor(fu1 * tex.GetSize(lev)))) + disp1 * du13;
                    vB = ((Math.floor(fv1 * tex.GetSize(lev)))) + disp1 * dv13;
                    y = _y1;
                    while (y <= _y2) {
                        var _xA = (xA);
                        var _xB = (xB);
                        var disp;
                        if (!(_xA > right || _xB < left)) {
                            disp = 0;
                            if (_xA < left) {
                                disp = left - _xA;
                                _xA = left;
                            }
                            if (_xB > right)
                                _xB = right;
                            i = _xB - _xA + 1;
                            wsk = (_xA | 0) + (y | 0) * this.width;
                            zwsk = (_xA | 0) + (y | 0) * this.width;
                            var du = ((uB - uA)) / (xB - xA + (1));
                            var dv = ((vB - vA)) / (xB - xA + (1));
                            var u = uA + disp * du;
                            var v = vA + disp * dv;
                            var dc = ((cB - cA)) / (xB - xA + (1));
                            var c = cA + disp * dc;
                            while (i-- > 0) {
                                if (z < zbuf[zwsk]) {
                                    this.buf[wsk] = this.FadeColor(tex.Peek(u, v), c);
                                    zbuf[zwsk] = z;
                                }
                                wsk++;
                                zwsk++;
                                u += du;
                                v += dv;
                                c += dc;
                            }
                        }
                        xA += d12;
                        xB += d13;
                        cA += dc12;
                        cB += dc13;
                        uA += du12;
                        vA += dv12;
                        uB += du13;
                        vB += dv13;
                        y++;
                    }
                    if (part == 1)
                        return;
                }
                d23 = ((x3 - x2)) / (y3 - y2);
                d13 = ((x3 - x1)) / (y3 - y1);
                dc23 = ((c3 - c2)) / (y3 - y2);
                dc13 = ((c3 - c1)) / (y3 - y1);
                du23 = Math.floor((fu3 - fu2) * tex.GetSize(lev)) / (y3 - y2);
                dv23 = Math.floor((fv3 - fv2) * tex.GetSize(lev)) / (y3 - y2);
                du13 = Math.floor((fu3 - fu1) * tex.GetSize(lev)) / (y3 - y1);
                dv13 = Math.floor((fv3 - fv1) * tex.GetSize(lev)) / (y3 - y1);
                xA = (x2) + disp2 * d23;
                xB = (x1) + (_y2 - y1) * d13;
                cA = (c2) + disp2 * dc23;
                cB = (c1) + (_y2 - y1) * dc13;
                uA = ((Math.floor(fu2 * tex.GetSize(lev)))) + disp2 * du23;
                vA = ((Math.floor(fv2 * tex.GetSize(lev)))) + disp2 * dv23;
                uB = ((Math.floor(fu1 * tex.GetSize(lev)))) + (_y2 - y1) * du13;
                vB = ((Math.floor(fv1 * tex.GetSize(lev)))) + (_y2 - y1) * dv13;
                if (xA > xB) {
                    var pom = d23;
                    d23 = d13;
                    d13 = pom;
                    pom = xB;
                    xB = xA;
                    xA = pom;
                    pom = dc23;
                    dc23 = dc13;
                    dc13 = pom;
                    pom = cB;
                    cB = cA;
                    cA = pom;
                    pom = du23;
                    du23 = du13;
                    du13 = pom;
                    pom = dv23;
                    dv23 = dv13;
                    dv13 = pom;
                    pom = uB;
                    uB = uA;
                    uA = pom;
                    pom = vB;
                    vB = vA;
                    vA = pom;
                }
                y = _y2;
                while (y <= _y3) {
                    if (xB < xA)
                        xB = xA;
                    var _xA = (xA);
                    var _xB = (xB);
                    var disp;
                    if (!(_xA > right || _xB < left)) {
                        disp = 0;
                        if (_xA < left) {
                            disp = left - _xA;
                            _xA = left;
                        }
                        if (_xB > right)
                            _xB = right;
                        i = _xB - _xA + 1;
                        wsk = (_xA | 0) + (y | 0) * this.width;
                        zwsk = (_xA | 0) + (y | 0) * this.width;
                        var du = ((uB - uA)) / (xB - xA + (1));
                        var dv = ((vB - vA)) / (xB - xA + (1));
                        var u = uA + disp * du;
                        var v = vA + disp * dv;
                        var dc = ((cB - cA)) / (xB - xA + (1));
                        var c = cA + disp * dc;
                        while (i-- > 0) {
                            if (z < zbuf[zwsk]) {
                                this.buf[wsk] = this.FadeColor(tex.Peek(u, v), c);
                                zbuf[zwsk] = z;
                            }
                            wsk++;
                            zwsk++;
                            u += du;
                            v += dv;
                            c += dc;
                        }
                    }
                    xA += d23;
                    xB += d13;
                    cA += dc23;
                    cB += dc13;
                    uA += du23;
                    vA += dv23;
                    uB += du13;
                    vB += dv13;
                    y++;
                }
            }
            FadeColor(c, fade) {
                return (((((c >> 16) & 255) * fade) << 8) & 0xff0000) | ((((c >> 8) & 255) * fade) & 0xff00) |
                    ((((c & 255) * fade) >> 8) & 0xff) | 0xff000000;
            }
            Clear() {
                this.buf.fill(ExprAE.D.RGB32(0, 0, 0), 0, this.buf.length);
            }
        }
        CWin.FIXED_SHIFT = 10;
        CWin.TEXT_FADE1 = 192;
        CWin.TEXT_FADE2 = 255;
        CWin.TEXT_FADEL = 30;
        Drawing.CWin = CWin;
    })(Drawing = ExprAE.Drawing || (ExprAE.Drawing = {}));
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    var Graph;
    (function (Graph) {
        var keys = ExprAE.System.Keys;
        var csys = ExprAE.System.CSys;
        class CGraph extends ExprAE.Drawing.CWin {
            constructor(width, height, buf, stdlib) {
                super(width, height, buf);
                this.stdlib = stdlib;
                this.Palette = [];
                this.s = [];
                this.cj = [];
                this.cp = [];
                this.j = [];
                this.p = [];
                this.reqredraw = 0;
                this.repmode = 0;
                this.titles = 0;
                this.axison = 0;
                this.gridon = 0;
                this.geps = 0;
                this.fitscr = 0;
                this.fps = 0;
                this.timer = 0;
                this.frames = 0;
                this.timer0 = 0;
                this.fpsmode = 0;
                this.cursorx = 0;
                this.cursory = 0;
                this.t1 = 0;
                this.t2 = 0;
                this.nt = 0;
                this.vangle = 0;
                this.A = new Array(0, 0, 0);
                this.R = 0;
                this.D = 0;
                this.N = 0;
                this.width_div_2 = 0;
                this.height_div_2 = 0;
                this.sinax = 0;
                this.cosax = 0;
                this.sinay = 0;
                this.cosay = 0;
                this.sinaz = 0;
                this.cosaz = 0;
                this.lightdist = 0;
                this.changepos3dmode = 0;
                this.holdlight = 0;
                this.modlvec = 0;
                this.xs = 0;
                this.ys = 0;
                this.zs = 0;
                this.hxs = 0;
                this.hys = 0;
                this.cx1 = 0;
                this.cy1 = 0;
                this.cx2 = 0;
                this.cy2 = 0;
                this.valtab = [];
                this.projecttab = [];
                this.normaltab = [];
                this.texcoordtab = [];
                this.dstate = 0;
                this.hold = 0;
                this.lighting = 0;
                this.twosidelighting = 0;
                this.light_vec = [];
                this.dstack = [];
                this.dstackl = 0;
                this.tex = [];
                this.envmap = [];
                this.tptr = [];
                this.t0ptr = [];
                this._255_lightdist = 0;
                this.circfunc_dir = 0;
                this.circfunc_disty = 0;
                this.circfunc_D2 = 0;
                this.circfunc_D4 = 0;
                this.circfunc_1_2_D = 0;
                this.circfunc_constcol = 0;
                this.gamemodeon = 0;
                this.physicsmodel = 0;
                this.envmapon = 0;
                this.DMode = 0;
                this.GraphState = 0;
                this.KeyFunc_prm = 0;
                this.p[Axis.X] = this.width;
                this.p[Axis.Y] = this.height;
                this.width_div_2 = this.width >> 1;
                this.height_div_2 = this.height >> 1;
                this.vangle = CGraph.DEFAULTVANLGE;
                this.setzdist();
                this.N = 0;
                this.fitscr = 0;
                this.changepos3dmode = 0;
                this.gms = new GAMEMODESTRUCT();
                this.defaults();
                this.dexprlist = [];
                this.dfuncstruct = Array.apply(null, Array(CGraph.MAXFUNCCOUNT)).map(function () { return new FUNCSTRUCT(0, 0); });
                this.zbuf = new Uint32Array(width * height);
                this.reqredraw = 1;
                this.repmode = 0;
                this.titles = 1;
                this.dmethod = DrawMethod.MLINE;
                this.lighting = 0;
                this.gridon = 0;
                this.axison = 1;
                this.dstackl = 0;
                this.geps = 3;
                this.fpsmode = 0;
                this.light_vec[3] = 0;
                this.lightdist = CGraph.DEFAULTR * 4;
                for (var i = 0; i < CGraph.MAXFUNCCOUNT; i++) {
                    this.tex[i] = ExprAE.Drawing.ExprImg.getTexture();
                }
                this.gms.grav = 9.81;
                this.gms.friction = 0.25;
                this.gms.player_height = 1.8;
                this.gms.player_mass = 70 * 1000;
                this.gms.player_maxvel = 8;
                this.gms.player_acc = 15;
                this.gms.player_jumpvel = 5;
                this.physicsmodel = PhysicsModel.ACCURATE;
                this.genpalettes();
                this.holdlight = 0;
                this.envmapon = 0;
            }
            Change(buf, width, height) {
                super.Change(buf, width, height);
                this.zbuf = new Uint32Array(width * height);
                this.width_div_2 = this.width >> 1;
                this.height_div_2 = this.height >> 1;
                this.p[Axis.X] = this.width;
                this.p[Axis.Y] = this.height;
                this.setzdist();
                this.s[Axis.X] = this.p[Axis.X] / CGraph.DEFAULT_JWIDTH;
                if (this.fitscr)
                    this.s[Axis.Y] = this.p[Axis.Y] / CGraph.DEFAULT_JWIDTH;
                else
                    this.s[Axis.Y] = this.p[Axis.Y] / CGraph.DEFAULT_JWIDTH * this.width / this.height;
                this.s[Axis.Z] = this.p[Axis.Z] / CGraph.DEFAULT_JWIDTH;
                this.reqredraw = 3;
                this.updatepos();
            }
            KeyFunc(k) {
                if (k != 256 + keys.K_SHIFT)
                    if (this.reqredraw <= 1)
                        this.reqredraw = 1;
                var m = 1, s = 1, dir = 1;
                if (k >> 8 != 0) {
                    m = 4;
                    s = 1.2;
                    dir = -1;
                }
                k &= 0xff;
                var changepos3ddelta = m;
                if (this.changepos3dmode == 0)
                    changepos3ddelta *= this.D;
                else
                    changepos3ddelta *= this.R * (1 / 256);
                for (var i = 0; i < DrawMode.MMAX; i++)
                    if (i + keys.K_1 == k) {
                        this.DMode = i;
                        this.reqredraw = 3;
                        break;
                    }
                if (k == keys.K_LEFT) {
                    this.ChangePos(-CGraph.POSDELTA * m, Axis.X);
                }
                else if (k == keys.K_RIGHT) {
                    this.ChangePos(CGraph.POSDELTA * m, Axis.X);
                }
                else if (k == keys.K_UP) {
                    this.ChangePos(CGraph.POSDELTA * m, Axis.Y);
                }
                else if (k == keys.K_DOWN) {
                    this.ChangePos(-CGraph.POSDELTA * m, Axis.Y);
                }
                else if (k == keys.K_HOME) {
                    this.defaults();
                }
                else if (k == keys.K_PAGE_UP) {
                    if (!this.Is3DMode()) {
                        this.ChangeScale(CGraph.SCALEDELTA * s, Axis.X);
                        this.ChangeScale(CGraph.SCALEDELTA * s, Axis.Y);
                    }
                    else
                        this.ChangePos(CGraph.POSDELTA * m, Axis.Z);
                }
                else if (k == keys.K_PAGE_DOWN) {
                    if (!this.Is3DMode()) {
                        this.ChangeScale(1 / CGraph.SCALEDELTA / s, Axis.X);
                        this.ChangeScale(1 / CGraph.SCALEDELTA / s, Axis.Y);
                    }
                    else
                        this.ChangePos(-CGraph.POSDELTA * m, Axis.Z);
                }
                else if (k == keys.K_DELETE) {
                    this.DelExpr(csys.DColor);
                    this.reqredraw = 2;
                }
                else if ((k == keys.K_TAB) && (this.hold == 0))
                    this.NextExpr();
                else if (k == keys.K_MINUS) {
                    this.nt -= m * 50;
                    if (this.nt < 50)
                        this.nt = 50;
                }
                else if (k == keys.K_EQUAL) {
                    this.nt += m * 50;
                }
                else if (k == keys.K_OPEN_BRACKET) {
                    this.t1 -= Math.pow(10, -this.geps + 2) * m;
                }
                else if (k == keys.K_CLOSE_BRACKET) {
                    this.t1 += Math.pow(10, -this.geps + 2) * m;
                }
                else if (k == keys.K_SEMICOLON) {
                    this.t2 -= Math.pow(10, -this.geps + 2) * m;
                }
                else if (k == keys.K_QUOTE) {
                    this.t2 += Math.pow(10, -this.geps + 2) * m;
                }
                else if (k == keys.K_Q) {
                    this.geps += dir;
                    if (this.geps < 1)
                        this.geps = 1;
                    else if (this.geps > 6)
                        this.geps = 6;
                }
                else if (k == keys.K_E) {
                    if (this.envmapon >= 0)
                        this.envmapon = 1 - this.envmapon;
                }
                if (k == keys.K_R) {
                    if (this.gamemodeon == 0)
                        this.repmode = 1 - this.repmode;
                }
                else if (k == keys.K_Z) {
                    this.titles = 1 - this.titles;
                }
                else if (k == keys.K_C) {
                    this.gridon = 1 - this.gridon;
                }
                else if (k == keys.K_G) {
                    this.twosidelighting = 1 - this.twosidelighting;
                }
                else if ((k == keys.K_H) && (this.Is3DMode())) {
                    if (this.hold)
                        this.hold = 0;
                    else
                        this.hold = -1;
                }
                else if (k == keys.K_J) {
                    this.modlvec = 1 - this.modlvec;
                }
                else if (k == keys.K_K) {
                    this.holdlight = 1 - this.holdlight;
                    if (this.hold)
                        this.hold = -1;
                }
                else if (k == keys.K_L) {
                    if (dir == 1)
                        this.lightdist *= CGraph.SCALEDELTA;
                    else
                        this.lightdist /= CGraph.SCALEDELTA;
                    if (this.lightdist < this.D)
                        this.lightdist = this.D;
                    if (this.hold)
                        this.hold = -1;
                }
                else if (k == keys.K_X) {
                    this.axison = 1 - this.axison;
                }
                else if ((k == keys.K_N) && (this.hold == 0) && (this.Is3DMode())) {
                    if (dir == 1)
                        this.D /= 2;
                    else
                        this.D *= 2;
                    if (this.R < 4 * this.D)
                        this.D /= 2;
                    if (this.D < CGraph.DEFAULTD / 256)
                        this.D = CGraph.DEFAULTD / 256;
                    this.reqredraw = 2;
                }
                else if ((k == keys.K_M) && (this.hold == 0) && (this.Is3DMode())) {
                    this.R += this.D * dir;
                    if (this.R < 4 * this.D)
                        this.R = 4 * this.D;
                    this.reqredraw = 2;
                }
                else if (k == keys.K_V) {
                    this.vangle += dir * (Math.PI / 180.0);
                    if (this.vangle < (Math.PI / 180.0) * 5)
                        this.vangle = (Math.PI / 180.0) * 5;
                    if (this.vangle > (Math.PI / 180.0) * 170)
                        this.vangle = (Math.PI / 180.0) * 170;
                    this.setzdist();
                    this.reqredraw = 2;
                }
                else if (k == keys.K_B) {
                    if (this.gamemodeon) {
                        this.gamemodeon = 0;
                        this.repmode = this.KeyFunc_prm;
                    }
                    else {
                        this.gamemodeon = 1;
                        this.gms.time = csys.GetTime();
                        this.KeyFunc_prm = this.repmode;
                        this.repmode = 1;
                    }
                }
                else if (k == keys.K_SLASH) {
                    if (this.physicsmodel == PhysicsModel.SIMPLE)
                        this.physicsmodel = PhysicsModel.ACCURATE;
                    else
                        this.physicsmodel = PhysicsModel.SIMPLE;
                }
                else if (k == keys.K_BACK_SLASH) {
                    this.fpsmode = 1 - this.fpsmode;
                    if (this.fpsmode == 1) {
                        this.frames = 0;
                        this.timer0 = csys.GetTime();
                    }
                }
                else if (k == keys.K_SPACE) {
                    if (this.gamemodeon)
                        this.gms.moveplayer |= 2;
                }
                else if ((k == keys.K_0) && (this.dfuncstruct[csys.DColor].status != 0)) {
                    var ey = this.stdlib.expr_y;
                    this.stdlib.expr_y = this.FJ(this.height - this.cursory, Axis.Y);
                    this.cursorx = this.FP(this.Findx0(this.dexprlist[csys.DColor], this.FJ(this.cursorx, Axis.X), this.FJ(this.width, Axis.X), 1 / this.s[Axis.X], 0.5 * Math.pow(10, -this.geps)), Axis.X);
                    csys.cursorPosSet(this.cursorx, this.cursory);
                    this.stdlib.expr_y = ey;
                }
                else if (k == keys.K_W) {
                    this.ChangePos3D(changepos3ddelta, this.A[Axis.X], this.A[Axis.Z]);
                }
                else if (k == keys.K_S) {
                    this.ChangePos3D(-changepos3ddelta, this.A[Axis.X], this.A[Axis.Z]);
                }
                else if (k == keys.K_A) {
                    this.ChangePos3D(changepos3ddelta, 0, this.A[Axis.Z] + Math.PI / 2);
                }
                else if (k == keys.K_D) {
                    this.ChangePos3D(changepos3ddelta, 0, this.A[Axis.Z] - Math.PI / 2);
                }
                else if (k == keys.K_F) {
                    this.fitscr = 1 - this.fitscr;
                    if (this.fitscr)
                        this.s[Axis.Y] /= this.width / this.height;
                    else
                        this.s[Axis.Y] *= this.width / this.height;
                    this.updatepos();
                }
                else if (k == keys.K_T) {
                    if (this.dmethod == DrawMethod.MTEX)
                        this.dmethod = DrawMethod.MFILL;
                    else
                        this.dmethod = DrawMethod.MTEX;
                    this.reqredraw = 2;
                    if (this.hold)
                        this.hold = -1;
                }
                else if (k == keys.K_U) {
                    if (this.dmethod > DrawMethod.MLINE)
                        this.dmethod = DrawMethod.MLINE;
                    else
                        this.dmethod = DrawMethod.MFILL;
                    this.reqredraw = 2;
                    if (this.hold)
                        this.hold = -1;
                }
                else if (k == keys.K_I) {
                    this.lighting = 1 - this.lighting;
                    this.reqredraw = 2;
                    if (this.hold)
                        this.hold = -1;
                }
                if (k == keys.K_P) {
                    this.changepos3dmode = 1 - this.changepos3dmode;
                }
                var mk = csys.MouseKey();
                if (mk) {
                    if (this.Is3DMode())
                        this.ChangePos3D(changepos3ddelta / 2 * ((mk == 2) ? -1 : 1), this.A[Axis.X], this.A[Axis.Z]);
                    else {
                        this.ChangePos(CGraph.POSDELTA * m * (2 * (mk == 1 ? 1 : 0) - 1) * (this.cursorx - this.width_div_2) / 100, Axis.X);
                        this.ChangePos(CGraph.POSDELTA * m * (2 * (mk == 1 ? 1 : 0) - 1) * (-this.cursory + this.height_div_2) / 100, Axis.Y);
                    }
                }
            }
            Process() {
                this.timer = csys.GetTime();
                this.handlemouse();
                if (this.dstackl == -2) {
                    this.dstackl = 0;
                }
                else if (this.reqredraw) {
                    if (this.Is3DMode()) {
                        if (this.dstackl != -1) {
                            if (this.reqredraw > 1)
                                this.dstackl = -2;
                        }
                        else
                            this.dstackl = 0;
                    }
                    else {
                        if (this.dstackl != -1) {
                            if ((this.repmode == 0) || (this.reqredraw > 1))
                                this.dstackl = -2;
                        }
                        else
                            this.dstackl = 0;
                    }
                    this.reqredraw = 0;
                }
                if (this.dstackl == -2) {
                    this.enddrawfunc();
                    return;
                }
                if (this.dstackl == 0) {
                    var i;
                    if (this.dfuncstruct[csys.DColor].status != 0) {
                        this.dstack[this.dstackl++] = csys.DColor;
                        this.dfuncstruct[csys.DColor].status = 1;
                    }
                    for (i = 0; i < CGraph.MAXFUNCCOUNT; i++)
                        if ((this.dfuncstruct[i].status != 0) && (csys.DColor != i)) {
                            this.dstack[this.dstackl++] = i;
                            this.dfuncstruct[i].status = 1;
                        }
                    if (this.dstackl > 0)
                        this.begindrawfunc();
                    else {
                        this.Clear();
                        this.DrawText(this.width_div_2 - CGraph.NOFUNCTEXT.length * this.fontwidth / 2, this.height_div_2 - this.fontheight / 2, csys.Color[csys.CHelp], CGraph.NOFUNCTEXT);
                    }
                }
                if (this.dstackl > 0) {
                    while (this.dstackl) {
                        if (this.dfuncstruct[this.dstack[this.dstackl - 1]].status == 1) {
                            this.dstate = 0;
                        }
                        if (!this.drawfunc(this.dexprlist[this.dstack[this.dstackl - 1]], this.dfuncstruct[this.dstack[this.dstackl - 1]]))
                            return;
                        if (this.gamemodeon)
                            this.updateplayer();
                        this.dstackl--;
                    }
                    this.enddrawfunc();
                    if (!this.repmode)
                        this.dstackl = -1;
                }
                this.gms.moveplayer = 0;
                if (this.hold == -1)
                    this.hold = csys.DColor + 1;
            }
            updatepos() {
                this.cj[Axis.X] = this.j[Axis.X] - this.p[Axis.X] / 2 / this.s[Axis.X];
                this.cj[Axis.Y] = this.j[Axis.Y] - this.p[Axis.Y] / 2 / this.s[Axis.Y];
                this.cj[Axis.Z] = this.j[Axis.Z] - this.p[Axis.Z] / 2 / this.s[Axis.Z];
                this.cp[Axis.X] = this.p[Axis.X] / 2 - this.s[Axis.X] * this.j[Axis.X];
                this.cp[Axis.Y] = this.p[Axis.Y] / 2 - this.s[Axis.Y] * this.j[Axis.Y];
                this.cp[Axis.Z] = this.p[Axis.Z] / 2 - this.s[Axis.Z] * this.j[Axis.Z];
            }
            setzdist() { this.p[Axis.Z] = this.width_div_2 / Math.tan(this.vangle / 2); }
            defaults() {
                this.j[Axis.X] = 0;
                this.j[Axis.Y] = 0;
                this.j[Axis.Z] = 0;
                this.s[Axis.X] = this.p[Axis.X] / CGraph.DEFAULT_JWIDTH;
                if (this.fitscr)
                    this.s[Axis.Y] = this.p[Axis.Y] / CGraph.DEFAULT_JWIDTH;
                else
                    this.s[Axis.Y] = this.p[Axis.Y] / CGraph.DEFAULT_JWIDTH * this.width / this.height;
                this.s[Axis.Z] = this.p[Axis.Z] / CGraph.DEFAULT_JWIDTH;
                this.A[Axis.X] = 0;
                this.A[Axis.Y] = 0;
                this.A[Axis.Z] = 0;
                this.t1 = -5;
                this.t2 = 5;
                this.nt = 1000;
                this.light_vec[0] = 0;
                this.light_vec[1] = 1;
                this.light_vec[2] = 0;
                this.R = CGraph.DEFAULTR;
                this.modlvec = 0;
                this.hold = 0;
                this.twosidelighting = 0;
                this.gamemodeon = 0;
                this.gms.player_vel = new VEC(0, 0, 0);
                this.gms.player_accv = new VEC2(0, 0);
                this.D = CGraph.DEFAULTD;
                this.cursorx = csys.getMouseX();
                this.cursory = csys.getMouseY();
                this.updatepos();
            }
            rotate(x, y, z) {
                var xr = x * this.cosaz + y * this.sinaz;
                var yr = -x * this.sinaz + y * this.cosaz;
                y = yr;
                var yr = y * this.cosax + z * this.sinax;
                var zr = -y * this.sinax + z * this.cosax;
                return new VEC(xr, yr, zr);
            }
            project(x, y, z) {
                if (z < CGraph.MINPROJECTZ)
                    return VEC2.invalid();
                var xp = Math.round(x * this.p[Axis.Z] / z) + this.width_div_2;
                var yp = -Math.round(y * this.p[Axis.Z] / z) + this.height_div_2;
                return new VEC2(xp, yp);
            }
            sqcircorners(x, y) {
                var x1 = Math.floor((x - this.R) / this.D) * this.D;
                var y1 = Math.ceil((y + this.R) / this.D) * this.D;
                var x2 = Math.ceil((x + this.R) / this.D) * this.D;
                var y2 = Math.floor((y - this.R) / this.D) * this.D;
                return new Array(new VEC2(x1, y1), new VEC2(x2, y2));
            }
            dotproduct(a, b) {
                if (!a || !b)
                    return 0;
                return a.a * b.a + a.b * b.b + a.c * b.c;
            }
            static GRAPHTAB_SIZE(size) {
                return size * size + 2 * size;
            }
            allocbuffers() {
                var nalloc = 0;
                var Npom = (((this.cx2 - this.cx1 > this.cy1 - this.cy2) ? this.cx2 - this.cx1 : this.cy1 - this.cy2) / this.D);
                if ((Npom != this.N) || (nalloc)) {
                    this.N = Npom;
                    var size = CGraph.GRAPHTAB_SIZE(this.N);
                    {
                        this.valtab = new Array(size);
                        this.projecttab = new Array(size);
                    }
                    if (this.lighting) {
                        this.normaltab = new Array(size);
                    }
                    this.colortab = new Uint8Array(size);
                    if (this.dmethod == DrawMethod.MTEX) {
                        this.texcoordtab = new Array(size);
                    }
                }
            }
            drawfunc(expr, f) {
                if (csys.GetTime() - this.timer > CGraph.MAXDRAWINGTIME)
                    return 0;
                if (this.DMode == DrawMode.K2DF1) {
                    this.drawfunc_K2DF1(expr, f);
                }
                else if (this.DMode == DrawMode.K2DXY) {
                    if (!this.drawfunc_K2DXY(expr, f))
                        return 0;
                }
                else if (this.DMode == DrawMode.K2DF2) {
                    if (!this.drawfunc_K2DF2(expr, f))
                        return 0;
                }
                else if (this.DMode == DrawMode.K3DF2) {
                    if (this.hold > 0)
                        if (f.color != this.hold - 1)
                            return 1;
                    if ((this.hold < 1) && (this.dstate == 0)) {
                        if (this.compvaltab(expr, f) == 0)
                            return 0;
                    }
                    else
                        f.status = 2;
                    {
                        if (this.dmethod == DrawMethod.MLINE) {
                            if (!this.drawfunc_K3DF2_soft_grid(f))
                                return 0;
                        }
                        else if (this.dmethod == DrawMethod.MFILL) {
                            if (this.lighting) {
                                if (!this.drawfunc_K3DF2_soft_fill_light(f))
                                    return 0;
                            }
                            else {
                                if (!this.drawfunc_K3DF2_soft_fill(f))
                                    return 0;
                            }
                        }
                        else if (this.dmethod == DrawMethod.MTEX) {
                            if (this.lighting) {
                                if (!this.drawfunc_K3DF2_soft_fill_tex_light(f))
                                    return 0;
                            }
                            else {
                                if (!this.drawfunc_K3DF2_soft_fill_tex(f))
                                    return 0;
                            }
                        }
                    }
                }
                return 1;
            }
            begindrawfunc() {
                this.stdlib.expr_time = csys.GetTime();
                csys.PresentWait = 0;
                this.GraphState = (GraphStateEnum.FillMode * (this.dmethod != DrawMethod.MLINE ? 1 : 0)) |
                    (GraphStateEnum.EnableTexture * (this.dmethod == DrawMethod.MTEX ? 1 : 0)) |
                    (GraphStateEnum.EnableLight * (this.lighting > 0 ? 1 : 0)) |
                    (GraphStateEnum.Enable3DMode * (this.DMode == DrawMode.K3DF2 ? 1 : 0));
                if (this.DMode == DrawMode.K3DF2) {
                    this.sinax = Math.sin(this.A[Axis.X]);
                    this.cosax = Math.cos(this.A[Axis.X]);
                    this.sinay = Math.sin(this.A[Axis.Y]);
                    this.cosay = Math.cos(this.A[Axis.Y]);
                    this.sinaz = Math.sin(this.A[Axis.Z]);
                    this.cosaz = Math.cos(this.A[Axis.Z]);
                    if (this.modlvec == 1) {
                        if (this.light_vec[3] == 0) {
                            this.light_vec[1] = -this.sinax;
                            this.light_vec[2] = this.cosax;
                            this.light_vec[0] = this.light_vec[2] * this.sinaz;
                            this.light_vec[2] = this.light_vec[2] * this.cosaz;
                        }
                        else if (this.light_vec[3] == 1) {
                            this.light_vec[0] = this.j[Axis.X];
                            this.light_vec[1] = this.j[Axis.Z];
                            this.light_vec[2] = -this.j[Axis.Y];
                        }
                    }
                    csys.PresentWait = 1;
                    this.xs = this.j[Axis.X];
                    this.ys = this.j[Axis.Y];
                    this.zs = this.j[Axis.Z];
                    if (this.dmethod != DrawMethod.MLINE) {
                        this.zbuf.fill(0xffffffff);
                    }
                    if (this.hold == 0) {
                        this.hxs = this.j[Axis.X];
                        this.hys = this.j[Axis.Y];
                        var vec = this.sqcircorners(this.hxs, this.hys);
                        this.cx1 = vec[0].u;
                        this.cy1 = vec[0].v;
                        this.cx2 = vec[1].u;
                        this.cy2 = vec[1].v;
                    }
                    this.allocbuffers();
                    csys.PresentWait = 1;
                }
                if (this.repmode)
                    csys.PresentWait = 1;
                this.Clear();
                if (this.axison && (!this.Is3DMode()))
                    this.drawaxis();
            }
            enddrawfunc() {
                if (this.DMode == DrawMode.K3DF2) {
                    if (this.lighting)
                        this.drawsun();
                }
                if (this.DMode == DrawMode.K3DF2) {
                }
                this.drawinfo();
                if (this.fpsmode == 0) {
                    if (csys.GetTime() - this.stdlib.expr_time > 0)
                        this.fps = 1 / (csys.GetTime() - this.stdlib.expr_time);
                }
                else {
                    this.fps = this.frames / (csys.GetTime() - this.timer0);
                }
                this.frames++;
                csys.PresentWait = 0;
            }
            drawfunc_K2DF1(expr, f) {
                var color = CGraph.Color[f.color];
                var i;
                var x1;
                var y1;
                var x2;
                var y2;
                f.status = 2;
                x1 = this.FJ(0, Axis.X);
                for (i = 1; i < this.width; i++) {
                    x2 = this.FJ(i, Axis.X);
                    this.stdlib.expr_x = x1;
                    y1 = this.height - this.FP(expr.do(), Axis.Y) + 0.5;
                    this.stdlib.expr_x = x2;
                    y2 = this.height - this.FP(expr.do(), Axis.Y) + 0.5;
                    if (!(ExprAE.D.IS_UD(y1) && ExprAE.D.IS_UD(y2))) {
                        if (ExprAE.D.IS_UD(y1))
                            y1 = this.height - this.FP(0, Axis.Y);
                        else if (ExprAE.D.IS_INFM(y1))
                            y1 = -1000000;
                        else if (ExprAE.D.IS_INFP(y1))
                            y1 = 1000000;
                        if (ExprAE.D.IS_UD(y2))
                            y2 = this.height - this.FP(0, Axis.Y);
                        else if (ExprAE.D.IS_INFM(y2))
                            y2 = -1000000;
                        else if (ExprAE.D.IS_INFP(y2))
                            y2 = 1000000;
                        if ((Math.abs(y1 - y2) < 1000) || ((Math.abs(y1 - y2) < 10000) && (y1 * y2 > 0))) {
                            this.VLine(i - 1, y1, ((y1 + y2) / 2), color);
                            this.VLine(i, ((y1 + y2) / 2), y2, color);
                        }
                    }
                    x1 = x2;
                }
                return 1;
            }
            drawfunc_K2DXY(expr, f) {
                var palwsk = this.Palette[f.color];
                var x1;
                var y1;
                var x2;
                var y2;
                if (f.status == 1) {
                    f.status = 2;
                    this.stdlib.expr_t = this.t1;
                }
                var dt = (this.t2 - this.t1) / (this.nt - 1);
                if (Math.abs(dt) <= 0.000001)
                    return 1;
                expr.do();
                x1 = this.stdlib.expr_x;
                y1 = this.stdlib.expr_y;
                if (ExprAE.D.IS_UD(x1))
                    x1 = 0;
                else if (ExprAE.D.IS_INFM(x1))
                    x1 = -10000;
                else if (ExprAE.D.IS_INFP(x1))
                    x1 = 10000;
                if (ExprAE.D.IS_UD(y1))
                    y1 = 0;
                else if (ExprAE.D.IS_INFM(y1))
                    y1 = -10000;
                else if (ExprAE.D.IS_INFP(y1))
                    y1 = 10000;
                this.stdlib.expr_t += dt;
                var i = 0;
                while (this.stdlib.expr_t <= this.t2) {
                    var w = expr.do();
                    var color;
                    if (w != 0) {
                        color = palwsk[w * 255 & 255];
                        x2 = this.stdlib.expr_x;
                        y2 = this.stdlib.expr_y;
                        if (ExprAE.D.IS_UD(x2))
                            x2 = 0;
                        else if (ExprAE.D.IS_INFM(x2))
                            x2 = -10000;
                        else if (ExprAE.D.IS_INFP(x2))
                            x2 = 10000;
                        if (ExprAE.D.IS_UD(y2))
                            y2 = 0;
                        else if (ExprAE.D.IS_INFM(y2))
                            y2 = -10000;
                        else if (ExprAE.D.IS_INFP(y2))
                            y2 = 10000;
                        this.Line(Math.round(this.FP(x1, Axis.X)), Math.round(this.height - this.FP(y1, Axis.Y)), Math.round(this.FP(x2, Axis.X)), Math.round(this.height - this.FP(y2, Axis.Y)), color);
                    }
                    x1 = x2;
                    y1 = y2;
                    this.stdlib.expr_t += dt;
                    i++;
                    if (i > 64) {
                        if (csys.GetTime() - this.timer > CGraph.MAXDRAWINGTIME) {
                            return 0;
                        }
                        i = 0;
                    }
                }
                this.stdlib.expr_t = this.t2;
                var w = expr.do();
                var color;
                if (w != 0) {
                    color = palwsk[(w * 255) & 255];
                }
                else
                    return 1;
                x2 = this.stdlib.expr_x;
                y2 = this.stdlib.expr_y;
                if (ExprAE.D.IS_UD(x2))
                    x2 = 0;
                else if (ExprAE.D.IS_INFM(x2))
                    x2 = -10000;
                else if (ExprAE.D.IS_INFP(x2))
                    x2 = 10000;
                if (ExprAE.D.IS_UD(y2))
                    y2 = 0;
                else if (ExprAE.D.IS_INFM(y2))
                    y2 = -10000;
                else if (ExprAE.D.IS_INFP(y2))
                    y2 = 10000;
                this.Line(Math.round(this.FP(x1, Axis.X)), Math.round(this.height - this.FP(y1, Axis.Y)), Math.round(this.FP(x2, Axis.X)), Math.round(this.height - this.FP(y2, Axis.Y)), color);
                return 1;
            }
            drawfunc_K2DF2(expr, f) {
                var i;
                var dbf;
                var palwsk = this.Palette[f.color];
                if (f.status == 1) {
                    this.drawfunc_K2DF2_bf = 0;
                    this.drawfunc_K2DF2_j = 0;
                    this.drawfunc_K2DF2_k = 0;
                    f.status = 2;
                }
                var d = this.height / CGraph.DLINES;
                var dx = 1 / this.s[Axis.X];
                var exprx0 = this.FJ(0, Axis.X);
                for (; this.drawfunc_K2DF2_j < d; this.drawfunc_K2DF2_j++) {
                    for (; this.drawfunc_K2DF2_k < CGraph.DLINES; this.drawfunc_K2DF2_k++) {
                        if (csys.GetTime() - this.timer > CGraph.MAXDRAWINGTIME) {
                            return 0;
                        }
                        dbf = this.drawfunc_K2DF2_bf + this.drawfunc_K2DF2_k * d * this.width;
                        this.stdlib.expr_y = this.FJ(-(this.drawfunc_K2DF2_j + this.drawfunc_K2DF2_k * d) + this.height, Axis.Y);
                        this.stdlib.expr_x = exprx0;
                        i = this.width;
                        while (i--) {
                            var w = expr.do();
                            if (w != 0) {
                                this.buf[dbf] = palwsk[w * 255 & 255];
                            }
                            dbf++;
                            this.stdlib.expr_x += dx;
                        }
                    }
                    this.drawfunc_K2DF2_bf += this.width;
                    this.drawfunc_K2DF2_k = 0;
                }
                return 1;
            }
            circlefunc(expr, f, state, rr, tabf, ladd, reffunc) {
                var R2 = rr * rr;
                this._255_lightdist = 255 / this.lightdist;
                this.circfunc_expr = expr;
                this.circfunc_D2 = this.D * this.D;
                this.circfunc_D4 = this.circfunc_D2 * this.circfunc_D2;
                this.circfunc_1_2_D = this.D / 2;
                if (f) {
                    this.circfunc_tex = this.tex[f.color];
                }
                var rtab = [];
                var nt = 0;
                if (tabf & G3DFlags.FVWSK)
                    rtab[nt++] = G3DPtrs.vwsk;
                if (tabf & G3DFlags.FPWSK)
                    rtab[nt++] = G3DPtrs.pwsk;
                if (tabf & G3DFlags.FNWSK)
                    rtab[nt++] = G3DPtrs.nwsk;
                if (tabf & G3DFlags.FCWSK)
                    rtab[nt++] = G3DPtrs.cwsk;
                if (tabf & G3DFlags.FTWSK)
                    rtab[nt++] = G3DPtrs.twsk;
                this.t0ptr[G3DPtrs.vwsk] = new Iterator(this.valtab, this.N);
                this.t0ptr[G3DPtrs.pwsk] = new Iterator(this.projecttab, this.N);
                this.t0ptr[G3DPtrs.nwsk] = new Iterator(this.normaltab, this.N);
                this.t0ptr[G3DPtrs.cwsk] = new Iterator(this.colortab, this.N);
                this.t0ptr[G3DPtrs.twsk] = new Iterator(this.texcoordtab, this.N);
                if (f)
                    this.circfunc_palwsk = new Uint32Array(this.Palette[f.color]);
                if (state == 0) {
                    this.circlefunc_y = Math.ceil((this.hys + rr) / this.D) * this.D;
                    this.circlefunc_rp = rr - this.D * CGraph.DMUL;
                    this.circlefunc_t = 0;
                }
                for (; this.circlefunc_t < 2; this.circlefunc_t++) {
                    this.circfunc_dir = 2 * this.circlefunc_t - 1;
                    while ((this.circlefunc_t == 0) ? (this.circlefunc_y >= this.hys) : (this.circlefunc_y <= this.hys)) {
                        if (csys.GetTime() - this.timer > CGraph.MAXDRAWINGTIME) {
                            return 0;
                        }
                        var x1;
                        var x2;
                        var sq;
                        var sqnumber;
                        var tab;
                        sq = Math.sqrt(R2 - this.circlefunc_rp * this.circlefunc_rp);
                        x1 = Math.floor((-sq + this.hxs) / this.D) * this.D;
                        x2 = Math.ceil((sq + this.hxs) / this.D) * this.D;
                        tab = -this.N * Math.ceil((this.circlefunc_y - this.cy1) / this.D) + Math.floor((x1 - this.cx1) / this.D);
                        this.circfunc_disty = Math.floor(CGraph.ZBUFMUL * (this.circlefunc_y - this.ys));
                        this.circfunc_disty *= this.circfunc_disty;
                        for (var j = 0; j < nt; j++) {
                            this.tptr[rtab[j]] = new Iterator(this.t0ptr[rtab[j]].ptr, tab);
                        }
                        sqnumber = ((x2 - x1) / this.D) + ladd;
                        for (var i = 0; i < sqnumber; i++) {
                            reffunc(x1, this.circlefunc_y);
                            x1 += this.D;
                            for (var j = 0; j < nt; j++) {
                                this.tptr[rtab[j]].next();
                            }
                        }
                        this.circlefunc_y += this.D * this.circfunc_dir;
                        this.circlefunc_rp -= this.D;
                    }
                    this.circlefunc_rp = rr - this.D * CGraph.DMUL;
                    this.circlefunc_y = Math.floor((this.hys - rr) / this.D) * this.D + (1 - ladd) * this.D;
                }
                return 1;
            }
            compvaltabref(x, y) {
                this.stdlib.expr_x = x;
                this.stdlib.expr_y = y;
                var z = this.circfunc_expr.do();
                if (ExprAE.D.IS_UD(z))
                    z = 0;
                else if (ExprAE.D.IS_INFM(z))
                    z = -10000;
                else if (ExprAE.D.IS_INFP(z))
                    z = 10000;
                this.tptr[G3DPtrs.vwsk].set(z);
            }
            compvaltab(expr, f) {
                var status;
                if (f.status == 1) {
                    f.status = 2;
                    status = 0;
                }
                else
                    status = 1;
                if (!this.circlefunc(expr, null, status, this.R, G3DFlags.FVWSK, 1, this.compvaltabref.bind(this)))
                    return 0;
                return 1;
            }
            compprojecttabref(x, y) {
                var z = this.tptr[G3DPtrs.vwsk].peek() - this.zs;
                var xr;
                var yr;
                var zr;
                var rotated = this.rotate(x - this.xs, y - this.ys, z);
                var xr = rotated.a, yr = rotated.b, zr = rotated.c;
                var v = this.project(xr, zr, yr);
                var xp = v.u;
                var yp = v.v;
                this.tptr[G3DPtrs.pwsk].set(new IPOINT(xp, yp));
            }
            compprojecttab() {
                var status = 1;
                if (this.dstate == DS.PROJECT) {
                    this.dstate++;
                    status = 0;
                }
                if (this.circlefunc(null, null, status, this.R, G3DFlags.FVWSK | G3DFlags.FPWSK, 1, this.compprojecttabref.bind(this)))
                    this.dstate++;
            }
            compnormaltabref(x, y) {
                var normwsk = this.tptr[G3DPtrs.nwsk];
                var z1;
                var z2;
                var z3;
                var z4;
                z1 = this.tptr[G3DPtrs.vwsk].peek(-this.N);
                z2 = this.tptr[G3DPtrs.vwsk].peek(1);
                z3 = this.tptr[G3DPtrs.vwsk].peek(this.N);
                z4 = this.tptr[G3DPtrs.vwsk].peek(-1);
                var a = this.circfunc_1_2_D * (z4 - z2);
                var c = this.circfunc_1_2_D * (z1 - z3);
                var d = 1 / Math.sqrt(a * a + this.circfunc_D4 + c * c);
                normwsk.set(new VEC(a * d, this.circfunc_D2 * d, c * d));
            }
            compnormaltab() {
                if (this.hold > 0) {
                    this.dstate += 2;
                    return;
                }
                var status;
                if (this.dstate == DS.NORMAL) {
                    status = 0;
                    this.dstate++;
                }
                else
                    status = 1;
                if (this.circlefunc(null, null, status, this.R - this.D, G3DFlags.FVWSK | G3DFlags.FNWSK, 1, this.compnormaltabref.bind(this)))
                    this.dstate++;
            }
            compcoltabref(x, y) {
                var z = this.tptr[G3DPtrs.vwsk].peek() - this.zs;
                x -= this.xs;
                y -= this.ys;
                var d = Math.sqrt(x * x + y * y + z * z);
                if (d > this.lightdist)
                    this.tptr[G3DPtrs.cwsk].set(0);
                else
                    this.tptr[G3DPtrs.cwsk].set((255 - d * this._255_lightdist) | 0);
            }
            compcoltab(color) {
                if (this.holdlight) {
                    if (this.hold > 0) {
                        this.dstate += 2;
                        return;
                    }
                    var c = Math.round(this.lightdist);
                    if (c > 255)
                        c = 255;
                    this.colortab.fill(c);
                    this.dstate += 2;
                    return;
                }
                var status;
                if (this.dstate == DS.COL) {
                    status = 0;
                    this.dstate++;
                }
                else
                    status = 1;
                if (this.circlefunc(null, null, status, this.R, G3DFlags.FVWSK | G3DFlags.FCWSK, 1, this.compcoltabref.bind(this)))
                    this.dstate++;
            }
            compcoltabnormalref(x, y) {
                var z = this.tptr[G3DPtrs.vwsk].peek() - this.zs;
                x -= this.xs;
                y -= this.ys;
                var d = Math.sqrt(x * x + y * y + z * z);
                if (d > this.lightdist)
                    this.tptr[G3DPtrs.cwsk].set(0);
                else {
                    var c = (this.dotproduct(this.tptr[G3DPtrs.nwsk].peek(), VEC.fromArray(this.light_vec)) * (255 - d * this._255_lightdist)) | 0;
                    if (c < 0)
                        c = 0;
                    this.tptr[G3DPtrs.cwsk].set(c);
                }
            }
            compcoltabnormalcconstref(x, y) {
                var c = (this.dotproduct(this.tptr[G3DPtrs.nwsk].peek(), VEC.fromArray(this.light_vec)) * this.circfunc_constcol) | 0;
                if (c < 0)
                    c = 0;
                this.tptr[G3DPtrs.cwsk].set(c);
            }
            compcoltabnormal(color) {
                var status;
                var d = 1 / Math.sqrt(this.light_vec[0] * this.light_vec[0] + this.light_vec[1] * this.light_vec[1] + this.light_vec[2] * this.light_vec[2]);
                this.compcoltabnormal_lightvec = VEC.fromArray(this.light_vec);
                this.light_vec[0] *= d;
                this.light_vec[1] *= d;
                this.light_vec[2] *= d;
                if (this.dstate == DS.COL) {
                    status = 0;
                    this.dstate++;
                }
                else
                    status = 1;
                if (this.holdlight) {
                    if (this.hold > 0) {
                        this.light_vec[0] = this.compcoltabnormal_lightvec.a;
                        this.light_vec[1] = this.compcoltabnormal_lightvec.b;
                        this.light_vec[2] = this.compcoltabnormal_lightvec.c;
                        this.dstate++;
                        return;
                    }
                    this.circfunc_constcol = this.lightdist;
                    if (this.circfunc_constcol > 255)
                        this.circfunc_constcol = 255;
                    if (this.circlefunc(null, null, status, this.R, G3DFlags.FVWSK | G3DFlags.FNWSK | G3DFlags.FCWSK, 1, this.compcoltabnormalcconstref.bind(this)))
                        this.dstate++;
                    this.light_vec[0] = this.compcoltabnormal_lightvec.a;
                    this.light_vec[1] = this.compcoltabnormal_lightvec.b;
                    this.light_vec[2] = this.compcoltabnormal_lightvec.c;
                    return;
                }
                if (this.circlefunc(null, null, status, this.R, G3DFlags.FVWSK | G3DFlags.FNWSK | G3DFlags.FCWSK, 1, this.compcoltabnormalref.bind(this)))
                    this.dstate++;
                this.light_vec[0] = this.compcoltabnormal_lightvec.a;
                this.light_vec[1] = this.compcoltabnormal_lightvec.b;
                this.light_vec[2] = this.compcoltabnormal_lightvec.c;
            }
            comptexcoordtabref(x, y) {
                this.tptr[G3DPtrs.twsk].set(new VEC2(this.circfunc_tex.GetU(x), this.circfunc_tex.GetV(-y)));
            }
            comptexcoordtab(f) {
                if (this.hold > 0) {
                    this.dstate += 2;
                    return;
                }
                var status;
                if (this.dstate == DS.TEX) {
                    status = 0;
                    this.dstate++;
                }
                else
                    status = 1;
                if (this.circlefunc(null, f, status, this.R, G3DFlags.FTWSK, 0, this.comptexcoordtabref.bind(this)))
                    this.dstate++;
            }
            drawfunc_K3DF2_soft_grid(f) {
                if (this.dstate < DS.PROJECT + 2) {
                    this.compprojecttab();
                    if (this.dstate != DS.PROJECT + 2)
                        return 0;
                    this.dstate += 2;
                }
                if (this.dstate < DS.COL + 2) {
                    this.compcoltab(f.color);
                    if (this.dstate != DS.COL + 2)
                        return 0;
                }
                if (this.dstate < DS.TEX + 2) {
                    this.dstate += 2;
                }
                var palwsk = this.Palette[f.color];
                var dx = this.D * this.cosaz, dy = this.D * this.sinaz;
                var DL;
                var R2;
                R2 = (this.R - this.D) * (this.R - this.D);
                DL = this.R - this.D * CGraph.DMUL - this.D + 0.001;
                if (this.dstate == DS.DRAW) {
                    this.drawfunc_K3DF2_soft_grid_rp = this.R - this.D * CGraph.DMUL - this.D;
                    this.dstate++;
                }
                var _1_D = 1 / this.D;
                while (Math.abs(this.drawfunc_K3DF2_soft_grid_rp) <= DL) {
                    if (csys.GetTime() - this.timer > CGraph.MAXDRAWINGTIME) {
                        return 0;
                    }
                    var x1;
                    var y1;
                    var x2;
                    var y2;
                    var sq;
                    var sqnumber;
                    sq = Math.sqrt(R2 - this.drawfunc_K3DF2_soft_grid_rp * this.drawfunc_K3DF2_soft_grid_rp);
                    x1 = -sq * this.cosaz - this.drawfunc_K3DF2_soft_grid_rp * this.sinaz + this.hxs;
                    y1 = -sq * this.sinaz + this.drawfunc_K3DF2_soft_grid_rp * this.cosaz + this.hys;
                    x2 = sq * this.cosaz - this.drawfunc_K3DF2_soft_grid_rp * this.sinaz + this.hxs;
                    y2 = sq * this.sinaz + this.drawfunc_K3DF2_soft_grid_rp * this.cosaz + this.hys;
                    sqnumber = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) * _1_D;
                    for (var i = 0; i < sqnumber; i++) {
                        var tab = -this.N * Math.ceil((y1 - this.cy1) * _1_D) + Math.floor((x1 - this.cx1) * _1_D) + this.N;
                        var xp1;
                        var yp1;
                        var xp2;
                        var yp2;
                        var xp3;
                        var yp3;
                        var xp4;
                        var yp4;
                        var col;
                        var p1 = this.projecttab[tab];
                        var p2 = this.projecttab[tab + 1];
                        var p3 = this.projecttab[tab + this.N + 1];
                        var p4 = this.projecttab[tab + this.N];
                        if (!(p1 == undefined || p2 == undefined || p3 == undefined || p4 == undefined)) {
                            xp1 = p1.x;
                            xp2 = p2.x;
                            xp3 = p3.x;
                            xp4 = p4.x;
                            if (!(xp1 == undefined || xp2 == undefined || xp3 == undefined || xp4 == undefined)) {
                                yp1 = p1.y;
                                yp2 = p2.y;
                                yp3 = p3.y;
                                yp4 = p4.y;
                                col = palwsk[this.colortab[tab]];
                                this.Line(xp1, yp1, xp2, yp2, col);
                                this.Line(xp2, yp2, xp3, yp3, col);
                                this.Line(xp3, yp3, xp4, yp4, col);
                                this.Line(xp4, yp4, xp1, yp1, col);
                            }
                        }
                        x1 += dx;
                        y1 += dy;
                    }
                    this.drawfunc_K3DF2_soft_grid_rp -= this.D;
                }
                return 1;
            }
            drawfunc_K3DF2_soft_fillref(x, y) {
                var prwsk = this.tptr[G3DPtrs.pwsk];
                var colwsk = this.tptr[G3DPtrs.cwsk];
                var xp1;
                var yp1;
                var xp2;
                var yp2;
                var xp3;
                var yp3;
                var xp4;
                var yp4;
                var p1 = prwsk.peek();
                var p2 = prwsk.peek(1);
                var p3 = prwsk.peek(this.N + 1);
                var p4 = prwsk.peek(this.N);
                if (p1 == undefined || p2 == undefined || p3 == undefined || p4 == undefined)
                    return;
                xp1 = p1.x;
                xp2 = p2.x;
                xp3 = p3.x;
                xp4 = p4.x;
                if (xp1 == undefined || xp2 == undefined || xp3 == undefined || xp4 == undefined)
                    return;
                yp1 = p1.y;
                yp2 = p2.y;
                yp3 = p3.y;
                yp4 = p4.y;
                var xi = (CGraph.ZBUFMUL * (x - this.xs)) | 0;
                var zi = (CGraph.ZBUFMUL * (this.tptr[G3DPtrs.vwsk].peek() - this.zs)) | 0;
                var d = xi * xi + this.circfunc_disty + zi * zi;
                this.GTriangle_z(xp1, yp1, xp2, yp2, xp3, yp3, colwsk.peek(), colwsk.peek(1), colwsk.peek(this.N + 1), this.circfunc_palwsk, d, this.zbuf);
                this.GTriangle_z(xp1, yp1, xp3, yp3, xp4, yp4, colwsk.peek(), colwsk.peek(this.N + 1), colwsk.peek(this.N), this.circfunc_palwsk, d, this.zbuf);
            }
            drawfunc_K3DF2_soft_fill(f) {
                if (this.dstate < DS.PROJECT + 2) {
                    this.compprojecttab();
                    if (this.dstate != DS.PROJECT + 2)
                        return 0;
                    this.dstate += 2;
                }
                if (this.dstate < DS.COL + 2) {
                    this.compcoltab(f.color);
                    if (this.dstate != DS.COL + 2)
                        return 0;
                }
                if (this.dstate < DS.TEX + 2) {
                    this.dstate += 2;
                }
                var status;
                if (this.dstate == DS.DRAW) {
                    status = 0;
                    this.dstate++;
                }
                else
                    status = 1;
                if (!this.circlefunc(null, f, status, this.R - this.D, G3DFlags.FVWSK | G3DFlags.FPWSK | G3DFlags.FCWSK, 0, this.drawfunc_K3DF2_soft_fillref.bind(this)))
                    return 0;
                return 1;
            }
            drawfunc_K3DF2_soft_fill_light(f) {
                if (this.dstate < DS.PROJECT + 2) {
                    this.compprojecttab();
                    if (this.dstate != DS.PROJECT + 2)
                        return 0;
                }
                if (this.dstate < DS.NORMAL + 2) {
                    this.compnormaltab();
                    if (this.dstate != DS.NORMAL + 2)
                        return 0;
                }
                if (this.dstate < DS.COL + 2) {
                    this.compcoltabnormal(f.color);
                    if (this.dstate != DS.COL + 2)
                        return 0;
                }
                if (this.dstate < DS.TEX + 2) {
                    this.dstate += 2;
                }
                var status;
                if (this.dstate == DS.DRAW) {
                    status = 0;
                    this.dstate++;
                }
                else
                    status = 1;
                if (!this.circlefunc(null, f, status, this.R - this.D, G3DFlags.FVWSK | G3DFlags.FPWSK | G3DFlags.FCWSK, 0, this.drawfunc_K3DF2_soft_fillref.bind(this)))
                    return 0;
                return 1;
            }
            drawfunc_K3DF2_soft_fill_texref(x, y) {
                var prwsk = this.tptr[G3DPtrs.pwsk];
                var texwsk = this.tptr[G3DPtrs.twsk];
                var colwsk = this.tptr[G3DPtrs.cwsk];
                var xp1;
                var yp1;
                var xp2;
                var yp2;
                var xp3;
                var yp3;
                var xp4;
                var yp4;
                var p1 = prwsk.peek();
                var p2 = prwsk.peek(1);
                var p3 = prwsk.peek(this.N + 1);
                var p4 = prwsk.peek(this.N);
                if (p1 == undefined || p2 == undefined || p3 == undefined || p4 == undefined)
                    return;
                xp1 = p1.x;
                xp2 = p2.x;
                xp3 = p3.x;
                xp4 = p4.x;
                if (xp1 == undefined || xp2 == undefined || xp3 == undefined || xp4 == undefined)
                    return;
                yp1 = p1.y;
                yp2 = p2.y;
                yp3 = p3.y;
                yp4 = p4.y;
                var xi = (CGraph.ZBUFMUL * (x - this.xs)) | 0;
                var zi = (CGraph.ZBUFMUL * (this.tptr[G3DPtrs.vwsk].peek() - this.zs)) | 0;
                var d = xi * xi + this.circfunc_disty + zi * zi;
                var tex1 = texwsk.peek();
                var tex2 = texwsk.peek(1);
                var tex3 = texwsk.peek(this.N + 1);
                var tex4 = texwsk.peek(this.N);
                if (tex1 == undefined || tex2 == undefined || tex3 == undefined || tex4 == undefined)
                    return;
                this.TTriangle_z(xp1, yp1, xp2, yp2, xp3, yp3, tex1.u, tex1.v, tex2.u, tex2.v, tex3.u, tex3.v, this.circfunc_tex, colwsk.peek(), colwsk.peek(1), colwsk.peek(this.N + 1), d, this.zbuf);
                this.TTriangle_z(xp1, yp1, xp3, yp3, xp4, yp4, tex1.u, tex1.v, tex3.u, tex3.v, tex4.u, tex4.v, this.circfunc_tex, colwsk.peek(), colwsk.peek(this.N + 1), colwsk.peek(this.N), d, this.zbuf);
            }
            drawfunc_K3DF2_soft_fill_tex(f) {
                if (!this.tex[f.color].IsLoaded()) {
                    return this.drawfunc_K3DF2_soft_fill(f);
                }
                if (this.dstate < DS.PROJECT + 2) {
                    this.compprojecttab();
                    if (this.dstate != DS.PROJECT + 2)
                        return 0;
                    this.dstate += 2;
                }
                if (this.dstate < DS.COL + 2) {
                    this.compcoltab(f.color);
                    if (this.dstate != DS.COL + 2)
                        return 0;
                }
                if (this.dstate < DS.TEX + 2) {
                    this.comptexcoordtab(f);
                    if (this.dstate != DS.TEX + 2)
                        return 0;
                }
                var status;
                if (this.dstate == DS.DRAW) {
                    status = 0;
                    this.dstate++;
                }
                else
                    status = 1;
                if (!this.circlefunc(null, f, status, this.R - this.D, G3DFlags.FVWSK | G3DFlags.FPWSK | G3DFlags.FCWSK | G3DFlags.FTWSK, 0, this.drawfunc_K3DF2_soft_fill_texref.bind(this)))
                    return 0;
                return 1;
            }
            drawfunc_K3DF2_soft_fill_tex_light(f) {
                if (!this.tex[f.color].IsLoaded()) {
                    return this.drawfunc_K3DF2_soft_fill_light(f);
                }
                if (this.dstate < DS.PROJECT + 2) {
                    this.compprojecttab();
                    if (this.dstate != DS.PROJECT + 2)
                        return 0;
                }
                if (this.dstate < DS.NORMAL + 2) {
                    this.compnormaltab();
                    if (this.dstate != DS.NORMAL + 2)
                        return 0;
                }
                if (this.dstate < DS.COL + 2) {
                    this.compcoltabnormal(f.color);
                    if (this.dstate != DS.COL + 2)
                        return 0;
                }
                if (this.dstate < DS.TEX + 2) {
                    this.comptexcoordtab(f);
                    if (this.dstate != DS.TEX + 2)
                        return 0;
                }
                var status;
                if (this.dstate == DS.DRAW) {
                    status = 0;
                    this.dstate++;
                }
                else
                    status = 1;
                if (!this.circlefunc(null, f, status, this.R - this.D, G3DFlags.FVWSK | G3DFlags.FPWSK | G3DFlags.FCWSK | G3DFlags.FTWSK, 0, this.drawfunc_K3DF2_soft_fill_texref.bind(this)))
                    return 0;
                return 1;
            }
            drawsun() {
            }
            drawaxis() {
                var bf;
                var i;
                this.HLine(0, this.height - this.FP(0, Axis.Y), this.width - 1, csys.Color[csys.CFaded]);
                this.VLine(this.FP(0, Axis.X), 0, this.height - 1, csys.Color[csys.CFaded]);
                var d = this.axisdelta(Axis.X);
                var x1;
                var x2;
                if (Math.floor(d) != 0) {
                    x1 = Math.floor(this.FJ(0, Axis.X) / Math.floor(d)) * Math.floor(d);
                    x2 = Math.floor(this.FJ(this.width, Axis.X));
                }
                else {
                    x1 = Math.floor(((1 / d) * (this.FJ(0, Axis.X))) / (1 / d));
                    x2 = this.FJ(this.width, Axis.X);
                }
                var x = 0;
                var y = this.height - Math.floor(this.FP(0, Axis.Y));
                while (x1 <= x2) {
                    if (x1 != 0) {
                        x = Math.floor(this.FP(x1, Axis.X));
                        this.PutPixel(x, y, csys.Color[csys.CNum]);
                        if (this.gridon)
                            this.VLine(x, 0, this.height, csys.Color[csys.CFaded]);
                        bf = x1.toPrecision(this.geps).replace(/(\d+)(\.)(\d+)(0+)$/, '$1$2$3');
                        this.DrawText3X5(x, y + 2, csys.Color[csys.CNum], bf);
                    }
                    x1 += d;
                }
                d = this.axisdelta(Axis.Y);
                var y1;
                var y2;
                if (Math.floor(d) != 0) {
                    y1 = Math.floor(this.FJ(0, Axis.Y) / Math.floor(d)) * Math.floor(d);
                    y2 = Math.floor(this.FJ(this.height, Axis.Y));
                }
                else {
                    y1 = Math.floor(((1 / d) * (this.FJ(0, Axis.Y))) / (1 / d));
                    y2 = this.FJ(this.height, Axis.Y);
                }
                x = Math.floor(this.FP(0, Axis.X));
                while (y1 <= y2) {
                    if (y1 != 0) {
                        y = this.height - Math.floor(this.FP(y1, Axis.Y));
                        if ((x >= 0) && (y >= 0) && (x < this.width) && (y < this.height))
                            this.PutPixel(x, y, csys.Color[csys.CNum]);
                        if (this.gridon)
                            this.HLine(0, y, this.width, csys.Color[csys.CFaded]);
                        bf = y1.toPrecision(this.geps).replace(/(\d+)(\.)(\d+)(0+)$/, '$1$2$3');
                        this.DrawText3X5(x + 2, y - 2, csys.Color[csys.CNum], bf);
                    }
                    y1 += d;
                }
            }
            drawinfo() {
                var bf;
                var i;
                var k;
                if ((this.titles) && (this.dfuncstruct[csys.DColor].status != 0)) {
                    i = 0;
                    for (k = 0; k < CGraph.MAXFUNCCOUNT; k++) {
                        if (this.dfuncstruct[k].status == 0)
                            continue;
                        var c;
                        if (csys.DColor == this.dfuncstruct[k].color)
                            c = CGraph.Color[this.dfuncstruct[k].color];
                        else
                            c = this.Palette[this.dfuncstruct[k].color][128];
                        this.DrawText3X5(0, i, c, this.dexprlist[k].getExprStr());
                        i += 5;
                    }
                    bf = this.fps.toPrecision(this.geps);
                    this.DrawText3X5(this.width - bf.length * 4 - 1, 0, csys.Color[csys.CHighlighted], bf);
                    var x1 = this.FJ(this.cursorx, Axis.X);
                    var y1 = this.FJ(this.height - this.cursory, Axis.Y);
                    if (!this.Is3DMode()) {
                        bf = "X=" + x1.toPrecision(this.geps) + " Y=" + y1.toPrecision(this.geps);
                        this.DrawText3X5(this.width - bf.length * 4 - 1, this.height - 5, csys.Color[csys.CHighlighted], bf);
                    }
                    else {
                        this.DrawText(this.width - 8 * this.fontwidth - 1, this.height - this.fontheight - 6, csys.Color[csys.CHelp], "SOFTWARE");
                        this.DrawText3X5(this.width - 8 * this.fontwidth + 1, this.height - 6, csys.Color[csys.CFaded], "R E N D E R E R");
                    }
                    if (this.DMode == DrawMode.K2DF1) {
                        this.stdlib.expr_x = x1;
                        bf = "F(" + x1.toPrecision(this.geps) + ")=" + this.dexprlist[csys.DColor].do().toPrecision(this.geps);
                    }
                    else if (this.DMode == DrawMode.K2DXY) {
                        bf = "t1=" + this.t1.toPrecision(this.geps) + " t2=" + this.t2.toPrecision(this.geps) + " n=" + this.nt.toPrecision(this.geps);
                    }
                    else if (this.DMode == DrawMode.K2DF2) {
                        this.stdlib.expr_x = x1;
                        this.stdlib.expr_y = y1;
                        bf = "F(" + x1.toPrecision(this.geps) + "," + y1.toPrecision(this.geps) + ")=" + this.dexprlist[csys.DColor].do().toPrecision(this.geps);
                    }
                    else if (this.DMode == DrawMode.K3DF2) {
                        bf = "X=" + this.j[Axis.X].toPrecision(this.geps) + " Y=" + this.j[Axis.Y].toPrecision(this.geps) +
                            " Z=" + this.j[Axis.Z].toPrecision(this.geps) + " D=" + this.D.toPrecision(this.geps) +
                            " R=" + this.R.toPrecision(this.geps) + " V=" + (this.N * this.N).toPrecision(this.geps);
                    }
                    this.DrawText3X5(0, this.height - 5, CGraph.Color[csys.DColor], bf);
                }
            }
            ChangeActiveState(state) {
                if (state == 0)
                    this.enddrawfunc();
                else
                    this.reqredraw = 3;
            }
            genpalettes() {
                for (var i = 0; i < CGraph.MAXFUNCCOUNT; i++) {
                    this.Palette[i] = [];
                    for (var j = 0; j < 256; j++)
                        this.Palette[i][j] = this.FadeColor(CGraph.Color[i], j);
                }
            }
            FP(j, axis) {
                return this.s[axis] * j + this.cp[axis];
            }
            FJ(p, axis) {
                return p / this.s[axis] + this.cj[axis];
            }
            axisdelta(axis) {
                var d;
                var ptab = new Array(1, 2, 5);
                var m;
                var p = 0;
                var sc = 0;
                if (axis == Axis.X)
                    sc = this.width;
                else if (axis == Axis.Y)
                    sc = this.height;
                d = sc / (this.FJ(sc, axis) - this.FJ(0, axis));
                if (d < CGraph.MINADELTA) {
                    m = 1;
                    do {
                        p++;
                        if (p > 2) {
                            p = 0;
                            m *= 10;
                        }
                    } while (d * (ptab[p] * m) < CGraph.MINADELTA);
                    return ptab[p] * m;
                }
                if (d >= CGraph.MINADELTA) {
                    var pm;
                    var pp;
                    m = 0.1;
                    p = 2;
                    pp = 0;
                    pm = 1;
                    while (d * (ptab[p] * m) >= CGraph.MINADELTA) {
                        pp = p;
                        pm = m;
                        p--;
                        if (p < 0) {
                            p = 2;
                            m /= 10;
                        }
                    }
                    return ptab[pp] * pm;
                }
                return 0;
            }
            Is3DMode() {
                return this.DMode == DrawMode.K3DF2;
            }
            handlemouse() {
                var cx;
                var cy;
                cx = csys.getMouseX();
                cy = csys.getMouseY();
                if ((cx != this.cursorx) || (cy != this.cursory)) {
                    if (this.Is3DMode()) {
                        this.A[Axis.Z] += (this.cursorx - cx) / 100;
                        this.A[Axis.X] += (this.cursory - cy) / 100;
                        csys.cursorPosSet(this.width_div_2, this.height_div_2);
                        cx = csys.getMouseX();
                        cy = csys.getMouseY();
                    }
                    this.cursorx = cx;
                    this.cursory = cy;
                    if (this.reqredraw < 1)
                        this.reqredraw = 1;
                    if (this.DMode == DrawMode.K2DF1)
                        this.stdlib.expr_y = this.FJ(this.height - this.cursory, Axis.Y);
                }
                if (!this.Is3DMode()) {
                    csys.cursorPosSet(-1, 0);
                }
            }
            ChangePos(d, axis) {
                this.j[axis] += d / this.s[axis];
                this.updatepos();
            }
            ChangePos3D(d, anglex, anglez) {
                if (this.gamemodeon) {
                    d /= Math.abs(d);
                    this.gms.player_accv.u = d * -Math.sin(anglez) * this.gms.player_acc;
                    this.gms.player_accv.v = d * Math.cos(anglez) * this.gms.player_acc;
                    this.gms.moveplayer |= 1;
                }
                else {
                    this.j[Axis.X] -= d * Math.sin(anglez) * Math.cos(anglex);
                    this.j[Axis.Y] += d * Math.cos(anglez) * Math.cos(anglex);
                    this.j[Axis.Z] += d * Math.sin(anglex);
                }
                this.updatepos();
            }
            ChangeScale(d, axis) {
                this.s[axis] *= d;
                this.updatepos();
            }
            SetExpr(name, expr, color, num) {
                if (num >= CGraph.MAXFUNCCOUNT) {
                    this.dexprlist[num % (CGraph.MAXFUNCCOUNT + 2)] = expr;
                }
                else {
                    this.dexprlist[num % CGraph.MAXFUNCCOUNT] = expr;
                    this.dfuncstruct[num % CGraph.MAXFUNCCOUNT].color = color % CGraph.Color.length;
                    this.dfuncstruct[num % CGraph.MAXFUNCCOUNT].status = expr ? 1 : 0;
                }
            }
            DelExpr(num) {
                this.dfuncstruct[num % CGraph.MAXFUNCCOUNT].status = 0;
                this.NextExpr();
            }
            NextExpr() {
                var k = csys.DColor + 1;
                for (var i = 0; i < CGraph.MAXFUNCCOUNT; i++)
                    if (this.dfuncstruct[(k + i) % CGraph.MAXFUNCCOUNT].status != 0) {
                        csys.DColor = (k + i) % CGraph.MAXFUNCCOUNT;
                        return;
                    }
                csys.DColor = 0;
            }
            getsurfz(x, y) {
                var x0 = Math.floor(x / this.D) * this.D, y0 = Math.ceil(y / this.D) * this.D;
                var tab = -this.N * Math.ceil((y0 - this.cy1) / this.D) + Math.floor((x0 - this.cx1) / this.D) + this.N;
                if ((tab < 0) || (tab >= this.N * this.N))
                    return new VEC(0, 0, 0);
                var trno;
                trno = ((x0 * (y0 - this.D) + x * y0 + (x0 + this.D) * y - x * (y0 - this.D) - x0 * y - (x0 + this.D) * y0) > 0) ? 1 : 2;
                var x1;
                var y1;
                var z1;
                var x2;
                var y2;
                var z2;
                var x3;
                var y3;
                var z3;
                {
                    if (trno == 1) {
                        x2 = x0;
                        y2 = y0;
                        z2 = this.valtab[tab];
                        x1 = x0 + this.D;
                        y1 = y0;
                        z1 = this.valtab[tab + 1];
                        x3 = x0 + this.D;
                        y3 = y0 - this.D;
                        z3 = this.valtab[tab + this.N + 1];
                    }
                    else {
                        x1 = x0;
                        y1 = y0 - this.D;
                        z1 = this.valtab[tab + this.N];
                        x2 = x0 + this.D;
                        y2 = y0 - this.D;
                        z2 = this.valtab[tab + this.N + 1];
                        x3 = x0;
                        y3 = y0;
                        z3 = this.valtab[tab];
                    }
                }
                var z12 = z1 + (x - x1) * (z1 - z2) / (x1 - x2);
                var z13 = z1 + (y - y1) * (z1 - z3) / (y1 - y3);
                var y23 = (x - x2) * (y2 - y3) / (x2 - x3) + y2;
                var x23 = (y - y2) * (x2 - x3) / (y2 - y3) + x2;
                var z23y = (y23 - y2) * (z2 - z3) / (y2 - y3) + z2;
                var z23x = (x23 - x2) * (z2 - z3) / (x2 - x3) + z2;
                if (y1 == y23)
                    y23 += 0.001;
                var z123 = (y - y1) * (z12 - z23y) / (y1 - y23) + z12;
                if (x1 == x23)
                    x23 += 0.001;
                var anglex = Math.atan((z23x - z13) / (x1 - x23));
                if (y1 == y23)
                    y23 += 0.001;
                var angley = Math.atan((z23y - z12) / (y1 - y23));
                return new VEC(anglex, angley, z123);
            }
            updateplayer() {
                var currtime = csys.GetTime();
                var deltatime = currtime - this.gms.time;
                this.gms.time = currtime;
                var jump = this.gms.moveplayer & 2;
                var vx;
                var vy;
                var dv0 = Math.sqrt(this.gms.player_vel.a * this.gms.player_vel.a + this.gms.player_vel.b * this.gms.player_vel.b);
                vx = this.gms.player_vel.a + this.gms.player_accv.u * deltatime;
                vy = this.gms.player_vel.b + this.gms.player_accv.v * deltatime;
                var dv = Math.sqrt(vx * vx + vy * vy);
                if ((dv < this.gms.player_maxvel) || (dv0 > dv)) {
                    this.gms.player_vel.a = vx;
                    this.gms.player_vel.b = vy;
                }
                if (this.physicsmodel == PhysicsModel.SIMPLE) {
                    if (dv > 0) {
                        this.gms.player_accv.u = -this.gms.player_vel.a / dv * this.gms.player_acc;
                        this.gms.player_accv.v = -this.gms.player_vel.b / dv * this.gms.player_acc;
                    }
                    if ((this.gms.moveplayer == 0) && (dv < this.gms.player_maxvel * 0.05)) {
                        this.gms.player_vel.a = 0;
                        this.gms.player_vel.b = 0;
                        this.gms.player_accv.u = 0;
                        this.gms.player_accv.v = 0;
                    }
                }
                else {
                    this.gms.player_accv.u = 0;
                    this.gms.player_accv.v = 0;
                }
                this.gms.player_vel.c -= this.gms.grav * deltatime;
                this.j[Axis.X] += this.gms.player_vel.a * deltatime;
                this.j[Axis.Y] += this.gms.player_vel.b * deltatime;
                this.j[Axis.Z] += this.gms.player_vel.c * deltatime;
                this.updatepos();
                var x = this.j[Axis.X], y = this.j[Axis.Y], z = this.j[Axis.Z] - this.gms.player_height;
                if ((x < this.cx1) || (x > this.cx2) || (y > this.cy1) || (y < this.cy2))
                    return;
                var vec = this.getsurfz(x, y);
                var anglex = vec.a;
                var angley = vec.b;
                var z123 = vec.c;
                if (z < z123) {
                    this.j[Axis.Z] = z123 + this.gms.player_height;
                    if (jump) {
                        this.gms.player_vel.c = this.gms.player_jumpvel;
                    }
                    else if (this.physicsmodel == PhysicsModel.ACCURATE) {
                        dv = Math.sqrt(this.gms.player_vel.a * this.gms.player_vel.a + this.gms.player_vel.c * this.gms.player_vel.c);
                        var vzx = Math.abs(dv * Math.sin(anglex));
                        dv = Math.sqrt(this.gms.player_vel.b * this.gms.player_vel.b + this.gms.player_vel.c * this.gms.player_vel.c);
                        var vzy = Math.abs(dv * Math.sin(angley));
                        this.gms.player_vel.c = -Math.sqrt(vzx * vzx + vzy * vzy);
                        var F = this.gms.grav * this.gms.player_mass;
                        var F1x = F * Math.sin(anglex);
                        var F2x = F * Math.cos(anglex);
                        var Ffx = F2x * this.gms.friction;
                        var F1y = F * Math.sin(angley);
                        var F2y = F * Math.cos(angley);
                        var Ffy = F2y * this.gms.friction;
                        var Fx = F1x * Math.cos(anglex);
                        var Fy = F1y * Math.cos(angley);
                        this.gms.player_vel.a += Fx / this.gms.player_mass * deltatime;
                        this.gms.player_vel.b += Fy / this.gms.player_mass * deltatime;
                        dv = Math.sqrt(this.gms.player_vel.a * this.gms.player_vel.a + this.gms.player_vel.b * this.gms.player_vel.b);
                        if (dv > 0) {
                            Ffx *= -this.gms.player_vel.a / dv;
                            Ffy *= -this.gms.player_vel.b / dv;
                            Ffx *= Math.cos(anglex);
                            Ffy *= Math.cos(angley);
                            var vx = this.gms.player_vel.a, vy = this.gms.player_vel.b;
                            this.gms.player_vel.a += Ffx / this.gms.player_mass * deltatime;
                            this.gms.player_vel.b += Ffy / this.gms.player_mass * deltatime;
                            if (vx * this.gms.player_vel.a < 0)
                                this.gms.player_vel.a = 0;
                            if (vy * this.gms.player_vel.b < 0)
                                this.gms.player_vel.b = 0;
                        }
                        else {
                            this.gms.player_vel.c = 0;
                        }
                    }
                    else {
                        this.gms.player_vel.c = 0;
                    }
                }
            }
            Findx0(expr, a, b, d, eps) {
                var x1 = a;
                var x2 = a + d;
                var i = 10000;
                while (x1 <= b) {
                    this.stdlib.expr_x = x1;
                    var y1 = expr.do();
                    this.stdlib.expr_x = x2;
                    var y2 = expr.do();
                    if (Math.abs(y1) <= eps)
                        return x1;
                    if (y1 * y2 < 0) {
                        var s = (y1 > 0) ? 1 : -1;
                        var y;
                        do {
                            this.stdlib.expr_x = 0.5 * (x1 + x2);
                            y = expr.do();
                            if (y * s > 0)
                                x1 = this.stdlib.expr_x;
                            else
                                x2 = this.stdlib.expr_x;
                            i--;
                        } while ((Math.abs(y) > eps) && (i > 0));
                        return this.stdlib.expr_x;
                    }
                    x1 = x2;
                    x2 += d;
                }
                return 0;
            }
            loadTex(numberOfFunc, tex) {
                this.tex[numberOfFunc % CGraph.MAXFUNCCOUNT] = tex;
            }
        }
        CGraph.DEFAULT_JWIDTH = 10;
        CGraph.POSDELTA = 4;
        CGraph.SCALEDELTA = 1.1;
        CGraph.MAXFUNCCOUNT = 8;
        CGraph.MAXDRAWINGTIME = 0.02;
        CGraph.DLINES = 16;
        CGraph.MINADELTA = 40;
        CGraph.DEFAULTVANLGE = 90 * Math.PI / 180;
        CGraph.DEFAULTR = 40;
        CGraph.DEFAULTD = 0.5;
        CGraph.MINPROJECTZ = 0.1;
        CGraph.DMUL = 0.50132;
        CGraph.ZBUFMUL = 64;
        CGraph.CUBEMAPTEXID = 64;
        CGraph.NOFUNCTEXT = "No function defined!";
        CGraph.Color = new Array(ExprAE.D.RGB32(255, 255, 255), ExprAE.D.RGB32(255, 0, 0), ExprAE.D.RGB32(0, 255, 0), ExprAE.D.RGB32(0, 0, 255), ExprAE.D.RGB32(255, 255, 0), ExprAE.D.RGB32(255, 0, 255), ExprAE.D.RGB32(0, 255, 255), ExprAE.D.RGB32(255, 128, 0));
        Graph.CGraph = CGraph;
        class FUNCSTRUCT {
            constructor(color, status) {
                this.color = color;
                this.status = status;
            }
        }
        Graph.FUNCSTRUCT = FUNCSTRUCT;
        class IPOINT {
            constructor(x, y) {
                this.x = x;
                this.y = y;
            }
        }
        Graph.IPOINT = IPOINT;
        class VEC {
            constructor(a, b, c) {
                this.a = a;
                this.b = b;
                this.c = c;
            }
            static fromArray(array) {
                return new VEC(array[0], array[1], array[2]);
            }
        }
        Graph.VEC = VEC;
        class VEC2 {
            constructor(u, v) {
                this.u = u;
                this.v = v;
            }
            static invalid() {
                return new VEC2(undefined, undefined);
            }
        }
        Graph.VEC2 = VEC2;
        class GAMEMODESTRUCT {
        }
        Graph.GAMEMODESTRUCT = GAMEMODESTRUCT;
        var DS;
        (function (DS) {
            DS[DS["PROJECT"] = 0] = "PROJECT";
            DS[DS["NORMAL"] = 2] = "NORMAL";
            DS[DS["COL"] = 4] = "COL";
            DS[DS["TEX"] = 6] = "TEX";
            DS[DS["DRAW"] = 8] = "DRAW";
        })(DS || (DS = {}));
        var DrawMode;
        (function (DrawMode) {
            DrawMode[DrawMode["K2DF1"] = 0] = "K2DF1";
            DrawMode[DrawMode["K2DF2"] = 1] = "K2DF2";
            DrawMode[DrawMode["K3DF2"] = 2] = "K3DF2";
            DrawMode[DrawMode["K2DXY"] = 3] = "K2DXY";
            DrawMode[DrawMode["MMAX"] = 4] = "MMAX";
        })(DrawMode || (DrawMode = {}));
        ;
        var DrawMethod;
        (function (DrawMethod) {
            DrawMethod[DrawMethod["MLINE"] = 0] = "MLINE";
            DrawMethod[DrawMethod["MFILL"] = 1] = "MFILL";
            DrawMethod[DrawMethod["MTEX"] = 2] = "MTEX";
            DrawMethod[DrawMethod["DMMAX"] = 3] = "DMMAX";
        })(DrawMethod || (DrawMethod = {}));
        var Axis;
        (function (Axis) {
            Axis[Axis["X"] = 0] = "X";
            Axis[Axis["Y"] = 1] = "Y";
            Axis[Axis["Z"] = 2] = "Z";
        })(Axis || (Axis = {}));
        var GraphStateEnum;
        (function (GraphStateEnum) {
            GraphStateEnum[GraphStateEnum["FillMode"] = 1] = "FillMode";
            GraphStateEnum[GraphStateEnum["EnableTexture"] = 2] = "EnableTexture";
            GraphStateEnum[GraphStateEnum["EnableLight"] = 4] = "EnableLight";
            GraphStateEnum[GraphStateEnum["Enable3DMode"] = 8] = "Enable3DMode";
            GraphStateEnum[GraphStateEnum["EnableOpenGL"] = 16] = "EnableOpenGL";
        })(GraphStateEnum || (GraphStateEnum = {}));
        var PhysicsModel;
        (function (PhysicsModel) {
            PhysicsModel[PhysicsModel["SIMPLE"] = 0] = "SIMPLE";
            PhysicsModel[PhysicsModel["ACCURATE"] = 1] = "ACCURATE";
        })(PhysicsModel || (PhysicsModel = {}));
        var G3DPtrs;
        (function (G3DPtrs) {
            G3DPtrs[G3DPtrs["vwsk"] = 0] = "vwsk";
            G3DPtrs[G3DPtrs["pwsk"] = 1] = "pwsk";
            G3DPtrs[G3DPtrs["nwsk"] = 2] = "nwsk";
            G3DPtrs[G3DPtrs["cwsk"] = 3] = "cwsk";
            G3DPtrs[G3DPtrs["twsk"] = 4] = "twsk";
        })(G3DPtrs || (G3DPtrs = {}));
        var G3DFlags;
        (function (G3DFlags) {
            G3DFlags[G3DFlags["FVWSK"] = 1] = "FVWSK";
            G3DFlags[G3DFlags["FPWSK"] = 2] = "FPWSK";
            G3DFlags[G3DFlags["FNWSK"] = 4] = "FNWSK";
            G3DFlags[G3DFlags["FCWSK"] = 8] = "FCWSK";
            G3DFlags[G3DFlags["FTWSK"] = 16] = "FTWSK";
        })(G3DFlags || (G3DFlags = {}));
        ;
        class Iterator {
            constructor(ptr, i) {
                this.ptr = ptr;
                this.i = i;
            }
            next() {
                this.i++;
            }
            peek(diff = 0) {
                return this.ptr[this.i + diff];
            }
            set(val) {
                this.ptr[this.i] = val;
            }
        }
    })(Graph = ExprAE.Graph || (ExprAE.Graph = {}));
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    var Graph;
    (function (Graph) {
        var keys = ExprAE.System.Keys;
        var sys = ExprAE.System.CSys;
        class CGraphTester extends ExprAE.Drawing.CWin {
            constructor(width, height, buf) {
                super(width, height, buf);
                this.posx = 0;
                this.posy = 0;
                this.change = true;
                this.pal = new Uint32Array(256);
                for (var i = 0; i < 256; i++) {
                    var element = ExprAE.D.RGB32(i, i, i);
                    this.pal[i] = element;
                }
            }
            KeyFunc(k) {
                if (k == keys.K_UP)
                    this.posy -= 10;
                if (k == keys.K_DOWN)
                    this.posy += 10;
                if (k == keys.K_RIGHT)
                    this.posx += 10;
                if (k == keys.K_LEFT)
                    this.posx -= 10;
                if (k == keys.K_PAGE_UP)
                    this.posy -= 25;
                if (k == keys.K_PAGE_DOWN)
                    this.posy += 25;
                if (k == keys.K_SPACE)
                    this.change = !this.change;
            }
            Process() {
                this.Clear();
                var mk = sys.MouseKey();
                if (mk) {
                    this.posx = sys.getMouseX();
                    this.posy = sys.getMouseY();
                }
                for (var i = 0; i < 100; i++) {
                    this.Line(this.posx - 150, this.posy - 150, this.posx + 0, this.posy + (-i * 2), ExprAE.D.RGB32(255, 0, 0));
                }
                var zbuf = new Uint32Array(this.width * this.height);
                zbuf.fill(0xffffff);
                this.GTriangle_z(this.posx - 50, this.posy - 50, this.posx + 100, this.posy + 50, this.posx + 50, this.posy + 150, 0, 100, 255, this.pal, 10, zbuf);
                this.HLine(100, 100, 200, ExprAE.D.RGB32(255, 255, 255));
                this.VLine(100, 100, 200, ExprAE.D.RGB32(255, 255, 255));
                this.Bar(230, 230, 270, 250, ExprAE.D.RGB32(255, 0, 0));
                this.fontheight = 8;
                this.DrawText(500, 300, ExprAE.D.RGB32(255, 0, 0), "A");
                this.DrawText(10, 10, ExprAE.D.RGB32(250, 250, 250), "Hello world!!! (x=" + this.posx + ", y=" + this.posy + ")");
                this.fontheight = 16;
                this.DrawText(10, 30, ExprAE.D.RGB32(250, 250, 250), "Hello world!!! (x=" + this.posx + ", y=" + this.posy + ")");
                this.DrawText3X5(10, 50, ExprAE.D.RGB32(250, 250, 250), "Hello world!!! (x=" + this.posx + ", y=" + this.posy + ")");
                if (this.change)
                    this.posy = (this.posy + 1) % this.height;
            }
            ChangeActiveState(state) {
            }
        }
        Graph.CGraphTester = CGraphTester;
    })(Graph = ExprAE.Graph || (ExprAE.Graph = {}));
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    var Expressions;
    (function (Expressions) {
        class CExpr {
            constructor(library = null) {
                this.library = library;
                this.ONPSTACKBUFLEN = 16;
                this.ONP_NUM = 0;
                this.ONP_NAME = 1;
                this.ONP_NAMEREF = 2;
                this.ONP_INUM = 3;
                this.EXPR_SET_BUFLEN = 512;
                this.MAXONPBUFLEN = this.EXPR_SET_BUFLEN;
                this.CHAR_NUM = 0;
                this.CHAR_LETTER = 1;
                this.CHAR_LBRACKET = 2;
                this.CHAR_RBRACKET = 3;
                this.CHAR_COMMA = 4;
                this.CHAR_QUOT = 5;
                this.CHAR_LSBRACKET = 6;
                this.CHAR_RSBRACKET = 7;
                this.CHAR_OTHER = 8;
                this.CHAR_HEXNUM = 9;
                this.CHAR_REF = 10;
                this.STRDATALEN = 256;
                this.RETSTRLEN = 64;
                this.MAXSTRINGS = 16;
                this.calltab = new Array(CExpr.CExpr_f0_i, CExpr.CExpr_f1_i, CExpr.CExpr_f2_i, CExpr.CExpr_f3_i);
                this.CExpr_operands = new Array(new Expressions.OP("+", "ADD", this.CExpr_op_add, 100), new Expressions.OP("-", "SUB", this.CExpr_op_sub, 100), new Expressions.OP("*", "MUL", this.CExpr_op_mul, 200), new Expressions.OP("/", "DIV", this.CExpr_op_div, 200), new Expressions.OP(":=", "SET", this.CExpr_op_set, 50));
                if (library) {
                    for (var i = 0; i < this.CExpr_operands.length - 1; i++) {
                        this.library.addElement(new Expressions.ELEMENT(this.CExpr_operands[i].fname, this.CExpr_operands[i].ref, Expressions.CLib.VAL_FLOAT, 2, 0, 0));
                    }
                    this.library.addElement(new Expressions.ELEMENT(this.CExpr_operands[i].fname, this.CExpr_operands[i].ref, Expressions.CLib.VAL_FLOAT, 2, Expressions.CLib.VAL_PTR, 0));
                    this.library.addElement(new Expressions.ELEMENT("CHS", this.CExpr_op_chs, 0, 1, 0, 0));
                }
            }
            set(expr) {
                this.isCompiled = false;
                this.onpl = 0;
                this.onp = [];
                this.onpstack = [];
                this.hashtab = [];
                this.exprstr = '';
                this.strdata = [];
                this.strdata[0] = '\0';
                this.retstr = [];
                this.retstr[0] = '\0';
                if (!expr || 0 === expr.length) {
                    return Expressions.ErrorCodes.NullStr;
                }
                expr = this.removeSpaces(expr);
                if (!expr) {
                    return Expressions.ErrorCodes.SyntaxError;
                }
                var bf = [];
                var stack = [];
                var sl = -1;
                var pom = 0;
                var pctype = -1;
                var ctype = -1;
                var stype = 0;
                var funcstack = [];
                var funcsl = -1;
                const freq = 0;
                const npar = 1;
                const parl = 2;
                const partype = 3;
                const bracketv = 4;
                var stron = 0;
                var strl = 0;
                var strl0 = 0;
                var strbson = 0;
                var strchar = '\0';
                var vstart = 2;
                var vcount = 0;
                var bcount = 0;
                var sbcount = 0;
                var sref = 0;
                var i;
                var c;
                this.strcount = 0;
                var isextracode = 0;
                var exprPos = 0;
                i = 0;
                this.onpl = 0;
                while (true) {
                    var c;
                    if (exprPos >= expr.length)
                        c = "\0";
                    else
                        c = expr[exprPos];
                    if (stron) {
                        if (!strbson && c == '\\') {
                            strbson = 1;
                        }
                        else if (c == strchar && !strbson) {
                            this.strdata[strl++] = '\0';
                            if (stron == 2) {
                                this.ionp();
                                this.onp[this.onpl][0] = this.ONP_NUM;
                                this.onp[this.onpl][1] = this.strlen(this.strdata, strl0);
                                this.onpl++;
                            }
                            else {
                                if (this.strcount == this.MAXSTRINGS)
                                    return Expressions.ErrorCodes.BufOverflow;
                                this.ionp();
                                this.onp[this.onpl][0] = this.ONP_INUM;
                                this.onp[this.onpl++][1] = strl0;
                                this.hashtab[this.strcount++] = this.str2hash(this.strdata, strl0);
                            }
                            stron = 0;
                            i = 0;
                            strl0 = strl;
                        }
                        else {
                            if (strbson == 1) {
                                if (c == 'n')
                                    c = '\n';
                                else if (c == 't')
                                    c = '\t';
                                else if (c == '0') {
                                    i = 0;
                                    while (1) {
                                        c = expr[exprPos++];
                                        var ct = this.chartype(c);
                                        if (ct != this.CHAR_NUM)
                                            break;
                                        bf[i++] = c;
                                    }
                                    exprPos -= 2;
                                    bf[i] = '\0';
                                    c = String.fromCharCode(this.atoi(bf));
                                }
                            }
                            this.strdata[strl++] = c;
                            if (strl >= this.STRDATALEN - 1)
                                return Expressions.ErrorCodes.BufOverflow;
                            if (c == '\u0000')
                                c = '\u0001';
                            strbson = 0;
                        }
                    }
                    else {
                        ctype = this.chartype(c);
                        if (funcsl >= 0) {
                            if ((funcstack[funcsl][freq] == -1) && (pctype != this.CHAR_LBRACKET))
                                return Expressions.ErrorCodes.SyntaxError;
                            if ((funcstack[funcsl][freq] == 2) && (pctype != this.CHAR_RBRACKET))
                                return Expressions.ErrorCodes.TooManyParams;
                        }
                        if (sref == 1) {
                            if (pctype == this.CHAR_LETTER)
                                sref = 2;
                            else
                                return Expressions.ErrorCodes.SyntaxError;
                        }
                        if ((ctype != pctype) && (!((pctype == this.CHAR_LETTER) && (ctype == this.CHAR_NUM)))
                            && (!((pctype == this.CHAR_HEXNUM) && (ctype == this.CHAR_NUM)))
                            && (!((stype == this.CHAR_HEXNUM) && (ctype == this.CHAR_LETTER))) ||
                            ((pctype == this.CHAR_LBRACKET) && (ctype == this.CHAR_LBRACKET)) ||
                            ((pctype == this.CHAR_RBRACKET) && (ctype == this.CHAR_RBRACKET)) ||
                            ((pctype == this.CHAR_LSBRACKET) && (ctype == this.CHAR_LSBRACKET)) ||
                            ((pctype == this.CHAR_RSBRACKET) && (ctype == this.CHAR_RSBRACKET)) ||
                            ((pctype == this.CHAR_QUOT) && (ctype == this.CHAR_QUOT))) {
                            if (i > 0) {
                                bf[i] = '\0';
                                switch (stype) {
                                    case this.CHAR_NUM:
                                        pom = this.atof(bf);
                                        break;
                                    case this.CHAR_LETTER:
                                        var n = this.library.find(this.getStrAt(bf));
                                        if (n == null)
                                            return Expressions.ErrorCodes.UndefinedName;
                                        if ((n.parattr & 0x80000000) == 0) {
                                            if (sref)
                                                return Expressions.ErrorCodes.SyntaxError;
                                            this.i(stack, sl + 1);
                                            this.i(funcstack, funcsl + 1);
                                            stack[++sl][0] = n;
                                            stack[sl][1] = 10000;
                                            funcstack[++funcsl][freq] = -1;
                                            funcstack[funcsl][npar] = n.parattr & 255;
                                            vcount -= funcstack[funcsl][npar] - 1;
                                            funcstack[funcsl][partype] = n.partypes;
                                            funcstack[funcsl][parl] = 0;
                                            funcstack[funcsl][bracketv] = bcount;
                                            var count = n.parattr & 255;
                                            for (var j = 0; j < count; j++) {
                                                if (this.library.getPar(n.partypes, j) == Expressions.CLib.VAL_STR)
                                                    isextracode = 1;
                                            }
                                            if (n.tag & (Expressions.CLib.TAG_EXTRACODE))
                                                isextracode = 1;
                                        }
                                        else {
                                            vcount++;
                                            this.ionp();
                                            if (sref) {
                                                this.onp[this.onpl][0] = this.ONP_NAMEREF;
                                                sref = 0;
                                            }
                                            else {
                                                this.onp[this.onpl][0] = this.ONP_NAME;
                                            }
                                            this.onp[this.onpl++][1] = n;
                                        }
                                        break;
                                    case this.CHAR_HEXNUM:
                                        pom = this.htoi(bf);
                                        break;
                                    case this.CHAR_OTHER:
                                        var oi;
                                        oi = this.opindex(bf);
                                        if (oi == -1)
                                            return Expressions.ErrorCodes.UnreconOp;
                                        if ((vstart == 1) && (oi == 1)) {
                                            var n = this.library.find("CHS");
                                            if (n == null)
                                                return Expressions.ErrorCodes.UndefinedName;
                                            this.i(stack, sl + 1);
                                            stack[++sl][0] = n;
                                            stack[sl][1] = 10000;
                                        }
                                        else {
                                            var n = this.library.find(this.CExpr_operands[oi].fname);
                                            if (n == null)
                                                return Expressions.ErrorCodes.UndefinedName;
                                            vcount -= 1;
                                            while ((sl >= 0) && (stack[sl][1] >= this.CExpr_operands[oi].p)) {
                                                this.ionp();
                                                this.onp[this.onpl][0] = this.ONP_NAME;
                                                this.onp[this.onpl++][1] = stack[sl--][0];
                                                if (this.onpl >= this.MAXONPBUFLEN)
                                                    return Expressions.ErrorCodes.BufOverflow;
                                            }
                                            this.i(stack, sl + 1);
                                            stack[++sl][0] = n;
                                            stack[sl][1] = this.CExpr_operands[oi].p;
                                        }
                                        break;
                                    case this.CHAR_LSBRACKET:
                                        sbcount++;
                                        if (this.onpl >= 1) {
                                        }
                                        else
                                            return Expressions.ErrorCodes.SyntaxError;
                                    case this.CHAR_LBRACKET:
                                        if (funcsl >= 0) {
                                            if (funcstack[funcsl][npar] > 0)
                                                funcstack[funcsl][freq] = 1;
                                            else
                                                funcstack[funcsl][freq] = 2;
                                        }
                                        vstart = 2;
                                        this.i(stack, sl + 1);
                                        stack[++sl][1] = 0;
                                        bcount++;
                                        break;
                                    case this.CHAR_RBRACKET:
                                    case this.CHAR_RSBRACKET:
                                        bcount--;
                                        if (bcount < 0)
                                            return Expressions.ErrorCodes.SyntaxError;
                                        while ((sl >= 0) && (stack[sl][1] > 0)) {
                                            this.ionp();
                                            this.onp[this.onpl][0] = this.ONP_NAME;
                                            this.onp[this.onpl++][1] = stack[sl--][0];
                                            if (this.onpl >= this.MAXONPBUFLEN)
                                                return Expressions.ErrorCodes.BufOverflow;
                                        }
                                        sl--;
                                        if (funcsl >= 0)
                                            if (funcstack[funcsl][bracketv] == bcount) {
                                                if ((funcstack[funcsl][freq] != 2) && (funcstack[funcsl][parl] != funcstack[funcsl][npar] - 1))
                                                    return Expressions.ErrorCodes.TooFewParams;
                                                this.ionp();
                                                this.onp[this.onpl][0] = this.ONP_NAME;
                                                this.onp[this.onpl++][1] = stack[sl--][0];
                                                if (this.onpl >= this.MAXONPBUFLEN)
                                                    return Expressions.ErrorCodes.BufOverflow;
                                                funcsl--;
                                            }
                                        if (stype == this.CHAR_RSBRACKET) {
                                            if (sbcount <= 0)
                                                return Expressions.ErrorCodes.SyntaxError;
                                            sbcount--;
                                            var n = this.library.find("PTR");
                                            if (n == null)
                                                return Expressions.ErrorCodes.UndefinedName;
                                            this.ionp();
                                            this.onp[this.onpl][0] = this.ONP_NAME;
                                            this.onp[this.onpl++][1] = n;
                                            vcount--;
                                        }
                                        else if (ctype == this.CHAR_LSBRACKET)
                                            return Expressions.ErrorCodes.SyntaxError;
                                        break;
                                    case this.CHAR_COMMA:
                                        if (funcsl == -1)
                                            return Expressions.ErrorCodes.SyntaxError;
                                        while ((sl >= 0) && (stack[sl][1] > 0)) {
                                            this.ionp();
                                            this.onp[this.onpl][0] = this.ONP_NAME;
                                            this.onp[this.onpl++][1] = stack[sl--][0];
                                            if (this.onpl >= this.MAXONPBUFLEN)
                                                return Expressions.ErrorCodes.BufOverflow;
                                        }
                                        sl--;
                                        vstart = 2;
                                        this.i(stack, sl + 1);
                                        stack[++sl][1] = 0;
                                        funcstack[funcsl][parl]++;
                                        if (funcstack[funcsl][parl] >= funcstack[funcsl][npar])
                                            return Expressions.ErrorCodes.TooManyParams;
                                        break;
                                    case this.CHAR_QUOT:
                                        if (funcsl == -1)
                                            return Expressions.ErrorCodes.SyntaxError;
                                        vcount++;
                                        if (this.library.getPar(funcstack[funcsl][partype], funcstack[funcsl][parl]) != Expressions.CLib.VAL_STR)
                                            stron = 2;
                                        else
                                            stron = 1;
                                        strchar = expr[exprPos - 1];
                                        strbson = 0;
                                        continue;
                                    case this.CHAR_REF:
                                        if (ctype != this.CHAR_LETTER)
                                            return Expressions.ErrorCodes.SyntaxError;
                                        sref = 1;
                                        break;
                                }
                                if ((stype == this.CHAR_NUM) || (stype == this.CHAR_HEXNUM)) {
                                    vcount++;
                                    this.ionp();
                                    this.onp[this.onpl][0] = this.ONP_NUM;
                                    this.onp[this.onpl][1] = pom;
                                    this.onpl++;
                                }
                                if (((stype == this.CHAR_NUM) || (stype == this.CHAR_HEXNUM)) &&
                                    ((ctype == this.CHAR_LETTER) || (ctype == this.CHAR_HEXNUM) || (ctype == this.CHAR_LBRACKET)) ||
                                    ((stype == this.CHAR_RBRACKET) && (ctype == this.CHAR_LBRACKET))) {
                                    var oi;
                                    oi = this.opindex(['*', '\0']);
                                    if (oi == -1)
                                        return Expressions.ErrorCodes.UnreconOp;
                                    var n = this.library.find(this.CExpr_operands[oi].fname);
                                    if (n == null)
                                        return Expressions.ErrorCodes.UndefinedName;
                                    vcount -= 1;
                                    while ((sl >= 0) && (stack[sl][1] >= this.CExpr_operands[oi].p)) {
                                        this.ionp();
                                        this.onp[this.onpl][0] = this.ONP_NAME;
                                        this.onp[this.onpl++][1] = stack[sl--][0];
                                        if (this.onpl >= this.MAXONPBUFLEN)
                                            return Expressions.ErrorCodes.BufOverflow;
                                    }
                                    this.i(stack, sl + 1);
                                    stack[++sl][0] = n;
                                    stack[sl][1] = this.CExpr_operands[oi].p;
                                }
                            }
                            i = 0;
                            stype = ctype;
                        }
                        bf[i++] = c;
                        if (i == this.EXPR_SET_BUFLEN)
                            return Expressions.ErrorCodes.BufOverflow;
                        pctype = ctype;
                        if (vstart == 2)
                            vstart = 1;
                        else
                            vstart = 0;
                    }
                    if (this.onpl >= this.MAXONPBUFLEN)
                        return Expressions.ErrorCodes.BufOverflow;
                    if (c == '\0')
                        break;
                    exprPos++;
                }
                if (funcsl >= 0)
                    if (funcstack[funcsl][freq] != 0)
                        return Expressions.ErrorCodes.SyntaxError;
                if ((bcount > 0) || (sbcount > 0))
                    return Expressions.ErrorCodes.SyntaxError;
                if (vcount != 1)
                    return Expressions.ErrorCodes.SyntaxError;
                while (sl >= 0) {
                    this.ionp();
                    this.onp[this.onpl][0] = this.ONP_NAME;
                    this.onp[this.onpl++][1] = stack[sl--][0];
                    if (this.onpl >= this.MAXONPBUFLEN)
                        return Expressions.ErrorCodes.BufOverflow;
                }
                this.isCompiled = true;
                this.exprstr = expr;
                return Expressions.ErrorCodes.NoErr;
            }
            do() {
                if (!this.isCompiled)
                    return null;
                this.onpsl = -1;
                var n;
                this.strcount = 0;
                for (var i = 0; i < this.onpl; i++) {
                    switch (this.onp[i][0]) {
                        case this.ONP_NUM:
                            this.i(this.onpstack, this.onpsl + 1);
                            this.onpstack[++this.onpsl][0] = Expressions.CLib.VAL_FLOAT;
                            this.onpstack[this.onpsl][1] = this.onp[i][1];
                            break;
                        case this.ONP_NAME:
                            n = this.onp[i][1];
                            var npa = n.parattr;
                            if (npa & 0x80000000) {
                                this.onpsl++;
                                this.i(this.onpstack, this.onpsl);
                                switch ((npa >> 8) & 255) {
                                    case Expressions.CLib.VAL_FLOAT:
                                        this.onpstack[this.onpsl][0] = Expressions.CLib.VAL_FLOAT;
                                        this.onpstack[this.onpsl][1] = n.fptr();
                                        break;
                                    case Expressions.CLib.VAL_INT:
                                        this.onpstack[this.onpsl][0] = Expressions.CLib.VAL_FLOAT;
                                        this.onpstack[this.onpsl][1] = n.fptr();
                                        break;
                                    case Expressions.CLib.VAL_STR:
                                        this.onpstack[this.onpsl][0] = Expressions.CLib.VAL_STR;
                                        this.onpstack[this.onpsl][1] = n.fptr();
                                        break;
                                    default: return 0;
                                }
                            }
                            else {
                                var pc = npa & 255;
                                var rt = (npa >> 8) & 3;
                                var stradd = 0;
                                var si = this.onpsl - pc + 1;
                                for (var j = 0; j < pc; j++) {
                                    var pt = this.library.getPar(n.partypes, j);
                                    var st = this.onpstack[si][0];
                                    if (pt != st) {
                                        if (st == Expressions.CLib.VAL_STR + 10)
                                            stradd++;
                                        if ((pt == Expressions.CLib.VAL_FLOAT) && (st != Expressions.CLib.VAL_FLOAT)) {
                                            this.onpstack[si][0] = Expressions.CLib.VAL_FLOAT;
                                        }
                                        else if ((pt != Expressions.CLib.VAL_FLOAT) && (st == Expressions.CLib.VAL_FLOAT)) {
                                            this.onpstack[si][0] = Expressions.CLib.VAL_INT;
                                        }
                                    }
                                    si++;
                                }
                                this.tag = n.tag;
                                if (rt == Expressions.CLib.VAL_FLOAT) {
                                    this.faddr = n.fptr;
                                    this.calltab[pc](this);
                                    this.onpstack[this.onpsl][0] = Expressions.CLib.VAL_FLOAT;
                                }
                                else {
                                    this.faddr = n.fptr;
                                    this.calltab[pc](this);
                                    if (rt == Expressions.CLib.VAL_INT) {
                                        this.onpstack[this.onpsl][0] = Expressions.CLib.VAL_FLOAT;
                                    }
                                    else {
                                        this.onpstack[this.onpsl][0] = Expressions.CLib.VAL_INT;
                                    }
                                }
                                this.strcount += stradd;
                            }
                            break;
                        case this.ONP_INUM:
                            this.i(this.onpstack, this.onpsl + 1);
                            this.onpstack[++this.onpsl][0] = Expressions.CLib.VAL_PTR + 10;
                            this.onpstack[this.onpsl][1] = this.getStrAt(this.strdata, this.onp[i][1]);
                            break;
                        case this.ONP_NAMEREF:
                            n = this.onp[i][1];
                            this.i(this.onpstack, this.onpsl + 1);
                            this.onpstack[++this.onpsl][0] = Expressions.CLib.VAL_PTR;
                            this.onpstack[this.onpsl][1] = n.fptr;
                            break;
                    }
                }
                if (this.onpsl > 0)
                    throw "Invalid stack";
                else
                    return this.onpstack[0][1];
            }
            getExprStr() {
                return this.exprstr;
            }
            atoi(arr, start = 0) {
                return parseInt(this.getStrAt(arr, start), 10);
            }
            htoi(arr, start = 0) {
                return parseInt(this.getStrAt(arr, start), 16);
            }
            atof(arr, start = 0) {
                return parseFloat(this.getStrAt(arr, start));
            }
            getStrAt(arr, start = 0) {
                var str = arr.join("");
                var index = str.indexOf('\0', start);
                if (index == -1)
                    index = str.length;
                str = str.slice(start, index);
                return str;
            }
            strlen(arr, start = 0) {
                var str = arr.join("");
                var index = str.indexOf('\0', start);
                if (index == -1)
                    index = str.length;
                return index - start;
            }
            str2hash(s, start = 0) {
                const SHIFT = 7;
                const P = 524287;
                var n = this.strlen(s, start);
                var i, hs;
                hs = s[start].charCodeAt(0) - 33;
                for (i = start + 1; i < n; i++)
                    hs = ((hs << SHIFT) + s[i].charCodeAt(0) - 33) % P;
                return hs;
            }
            chartype(c) {
                if ((c >= '0') && (c <= '9') || (c == '.'))
                    return this.CHAR_NUM;
                if (((c >= 'A') && (c <= 'Z')) || ((c >= 'a') && (c <= 'z')) || (c == '_'))
                    return this.CHAR_LETTER;
                if (c == '(')
                    return this.CHAR_LBRACKET;
                if (c == ')')
                    return this.CHAR_RBRACKET;
                if (c == ',')
                    return this.CHAR_COMMA;
                if ((c == '"') || (c == '\''))
                    return this.CHAR_QUOT;
                if (c == '[')
                    return this.CHAR_LSBRACKET;
                if (c == ']')
                    return this.CHAR_RSBRACKET;
                if (c == '$')
                    return this.CHAR_HEXNUM;
                if (c == '@')
                    return this.CHAR_REF;
                if (c == '\0')
                    return -1;
                return this.CHAR_OTHER;
            }
            opindex(s) {
                for (var i = 0; i < this.CExpr_operands.length; i++) {
                    var j = 0;
                    while ((this.CExpr_operands[i].opname[j] == s[j]) && (s[j] != '\0'))
                        j++;
                    if (s[j] == '\0')
                        return i;
                }
                return -1;
            }
            removeSpaces(expr) {
                var isString = false;
                var isBackSlash = false;
                var stringChar;
                var resultBuf = [];
                for (var i = 0; i < expr.length; i++) {
                    var c = expr[i];
                    if (isString) {
                        if (!isBackSlash && (c == '\\'))
                            isBackSlash = true;
                        else {
                            if ((c == stringChar) && !isBackSlash)
                                isString = false;
                            isBackSlash = false;
                        }
                    }
                    else {
                        if ((c == '"') || (c == '\'')) {
                            isString = true;
                            stringChar = c;
                        }
                    }
                    if ((c != ' ') || isString)
                        resultBuf[i] = c;
                }
                if (isString) {
                    return null;
                }
                return resultBuf.join('');
            }
            ionp() {
                if (this.onp[this.onpl] == undefined)
                    this.onp[this.onpl] = [];
            }
            i(a, p) {
                if (a[p] == undefined)
                    a[p] = [];
            }
            static CExpr_f0_i(e) {
                e.onpstack[++e.onpsl][1] = e.faddr();
            }
            static CExpr_f1_i(e) {
                e.onpstack[e.onpsl][1] = e.faddr(e.onpstack[e.onpsl][1]);
            }
            static CExpr_f2_i(e) {
                e.onpstack[e.onpsl - 1][1] = e.faddr(e.onpstack[e.onpsl - 1][1], e.onpstack[e.onpsl][1]);
                e.onpsl -= 1;
            }
            static CExpr_f3_i(e) {
                e.onpstack[e.onpsl - 2][1] = e.faddr(e.onpstack[e.onpsl - 2][1], e.onpstack[e.onpsl - 1][1], e.onpstack[e.onpsl][1]);
                e.onpsl -= 2;
            }
            CExpr_op_add(a, b) {
                return a + b;
            }
            CExpr_op_sub(a, b) {
                return a - b;
            }
            CExpr_op_mul(a, b) {
                return a * b;
            }
            CExpr_op_div(a, b) {
                return a / b;
            }
            CExpr_op_set(ptr, val) {
                if (typeof ptr === "function")
                    return ptr(val);
                else
                    return 0;
            }
            CExpr_op_chs(a) {
                return -a;
            }
        }
        Expressions.CExpr = CExpr;
    })(Expressions = ExprAE.Expressions || (ExprAE.Expressions = {}));
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    var Expressions;
    (function (Expressions) {
        class CLib {
            constructor(elist = null) {
                this.root = new ND();
                if (elist)
                    this.addList(elist);
            }
            addElement(e) {
                var i, j;
                var itab = this.toIndexTab(e.name);
                var nd;
                nd = this.root;
                for (i = 0; i < itab.length; i++) {
                    j = itab[i];
                    if (nd.l[j] == null) {
                        nd.l[j] = new ND();
                    }
                    nd = nd.l[j];
                }
                if (nd.n == null)
                    nd.n = new NAME(e.fptr.bind(e.th));
                i = e.parcount;
                if (i == CLib.VAR) {
                    nd.n.parattr = ((e.rtype & 255) << 8) | 0x80000000;
                    nd.n.partypes = 0;
                }
                else {
                    if (i > 15)
                        i = 15;
                    nd.n.parattr = (i & 255) | ((e.rtype & 255) << 8);
                    nd.n.partypes = 0;
                    for (j = 0; j < i; j++) {
                        nd.n.partypes |= ((e.partypes >> (j << 1)) & 3) << (j << 1);
                    }
                }
                nd.n.tag = e.tag;
            }
            delElement(name) {
                var i, j;
                var itab = this.toIndexTab(name);
                var nd;
                nd = this.root;
                for (i = 0; i < itab.length; i++) {
                    j = itab[i];
                    if (nd.l[j] == null)
                        return;
                    nd = nd.l[j];
                }
                if (nd.n) {
                    nd.n = null;
                }
            }
            addList(elist) {
                for (var i = 0; i < elist.length; i++) {
                    this.addElement(elist[i]);
                }
            }
            find(name) {
                var i, j;
                var itab = this.toIndexTab(name);
                var nd;
                nd = this.root;
                for (i = 0; i < itab.length; i++) {
                    j = itab[i];
                    if (nd.l[j] == null)
                        return null;
                    nd = nd.l[j];
                }
                return nd.n;
            }
            NListFromTxt(_t, schar) {
                var w = 0;
                var t = [];
                var postab = [];
                var i = 0, k = 0, j = 0;
                var pomt = [];
                var pomt2 = [];
                var tl = 0;
                var ret = [];
                postab[0] = 0;
                while (i < _t.length) {
                    if (_t[i] == schar)
                        postab[++k] = i + 1;
                    else
                        t[i] = this.index(_t[i]);
                    if (t[i] == -1)
                        return new NListFromTxtResult(w, ret.join(""));
                    i++;
                }
                _t = _t.toUpperCase();
                postab[++k] = -1;
                var stack = [];
                var nstack = [];
                var sl = 0;
                var n;
                stack[0] = [];
                stack[0][0] = 0;
                stack[0][1] = 0;
                stack[0][2] = -1;
                nstack[0] = this.root;
                while (sl >= 0) {
                    if (!stack[sl])
                        stack[sl] = [];
                    tl = stack[sl][2];
                    if (tl >= 0) {
                        pomt[tl] = stack[sl][0];
                    }
                    j = stack[sl][1];
                    n = nstack[sl];
                    sl--;
                    if (postab[j + 1] != -1) {
                        for (i = postab[j]; i < postab[j + 1] - 1; i++) {
                            if (n.l[t[i]]) {
                                sl++;
                                if (!stack[sl])
                                    stack[sl] = [];
                                stack[sl][0] = _t[i].charCodeAt(0);
                                stack[sl][1] = j + 1;
                                stack[sl][2] = tl + 1;
                                nstack[sl] = n.l[t[i]];
                            }
                        }
                    }
                    else {
                        for (i = 0; i < n.l.length; i++) {
                            if (n.l[i]) {
                                sl++;
                                if (!stack[sl])
                                    stack[sl] = [];
                                stack[sl][0] = this.unindex(i).charCodeAt(0);
                                stack[sl][1] = j;
                                stack[sl][2] = tl + 1;
                                nstack[sl] = n.l[i];
                            }
                        }
                        if (n.n) {
                            pomt[tl + 1] = schar.charCodeAt(0);
                            pomt = pomt.slice(0, tl + 2);
                            pomt2 = pomt2.concat(pomt);
                            w++;
                        }
                    }
                }
                i = 0;
                var j2 = pomt2.length;
                pomt2[j2--] = 0;
                while (pomt2[i] != 0) {
                    k = i;
                    while (pomt2[i] != 0 && (pomt2[k] != schar.charCodeAt(0)))
                        k++;
                    var d = k - i;
                    for (j = 0; j < d; j++)
                        ret[j2 - d + j] = String.fromCharCode(pomt2[j + i]);
                    ret[j2] = schar;
                    j2 -= d + 1;
                    i = k + 1;
                }
                return new NListFromTxtResult(w, ret.join(""));
            }
            getPar(p, n) {
                return (((p) >> ((n) << 1)) & 3);
            }
            toIndexTab(str) {
                var sl = str.length;
                if (sl > CLib.MAXNAMELEN)
                    sl = CLib.MAXNAMELEN;
                var itab = [];
                for (var i = 0; i < sl; i++) {
                    itab[i] = this.index(str[i]);
                    if (itab[i] == -1)
                        return;
                }
                return itab;
            }
            index(c) {
                if ((c >= 'A') && (c <= 'Z'))
                    return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
                if ((c >= 'a') && (c <= 'z'))
                    return c.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
                if ((c >= '0') && (c <= '9'))
                    return c.charCodeAt(0) - '0'.charCodeAt(0);
                if (c == '_')
                    return 'Z'.charCodeAt(0) - 'A'.charCodeAt(0) + 11;
                return -1;
            }
            unindex(i) {
                if ((i >= 10) && (i <= 10 + 'Z'.charCodeAt(0) - 'A'.charCodeAt(0)))
                    return String.fromCharCode('A'.charCodeAt(0) + i - 10);
                if ((i >= 0) && (i <= 9))
                    return String.fromCharCode(i + '0'.charCodeAt(0));
                if (i == 'Z'.charCodeAt(0) - 'A'.charCodeAt(0) + 11)
                    return '_';
                return '\0';
            }
        }
        CLib.MAXNAMELEN = 64;
        CLib.VAL_FLOAT = 0;
        CLib.VAL_INT = 2;
        CLib.VAL_STR = 3;
        CLib.VAL_PTR = 3;
        CLib.VAR = 0xffffffff;
        CLib.MAXTXTLEN = 1024;
        CLib.TAG_EXTRACODE = 0x10000;
        Expressions.CLib = CLib;
        class NAME {
            constructor(fptr, parattr = 0, partypes = 0, tag = 0) {
                this.fptr = fptr;
                this.parattr = parattr;
                this.partypes = partypes;
                this.tag = tag;
            }
        }
        Expressions.NAME = NAME;
        class ND {
            constructor() {
                this.l = [];
                this.n = null;
            }
        }
        Expressions.ND = ND;
        class ELEMENT {
            constructor(name, fptr, rtype, parcount, partypes, tag, th = null) {
                this.name = name;
                this.fptr = fptr;
                this.rtype = rtype;
                this.parcount = parcount;
                this.partypes = partypes;
                this.tag = tag;
                this.th = th;
            }
        }
        Expressions.ELEMENT = ELEMENT;
        class NListFromTxtResult {
            constructor(w, ret) {
                this.w = w;
                this.ret = ret;
            }
        }
        Expressions.NListFromTxtResult = NListFromTxtResult;
    })(Expressions = ExprAE.Expressions || (ExprAE.Expressions = {}));
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    var Expressions;
    (function (Expressions) {
        (function (ErrorCodes) {
            ErrorCodes[ErrorCodes["NoErr"] = 0] = "NoErr";
            ErrorCodes[ErrorCodes["NullStr"] = 1] = "NullStr";
            ErrorCodes[ErrorCodes["UndefinedName"] = 2] = "UndefinedName";
            ErrorCodes[ErrorCodes["SyntaxError"] = 3] = "SyntaxError";
            ErrorCodes[ErrorCodes["BufOverflow"] = 4] = "BufOverflow";
            ErrorCodes[ErrorCodes["TooManyParams"] = 5] = "TooManyParams";
            ErrorCodes[ErrorCodes["TooFewParams"] = 6] = "TooFewParams";
            ErrorCodes[ErrorCodes["UnreconOp"] = 7] = "UnreconOp";
        })(Expressions.ErrorCodes || (Expressions.ErrorCodes = {}));
        var ErrorCodes = Expressions.ErrorCodes;
    })(Expressions = ExprAE.Expressions || (ExprAE.Expressions = {}));
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    var Expressions;
    (function (Expressions) {
        class OP {
            constructor(opname, fname, ref, p) {
                this.opname = opname;
                this.fname = fname;
                this.ref = ref;
                this.p = p;
            }
        }
        Expressions.OP = OP;
    })(Expressions = ExprAE.Expressions || (ExprAE.Expressions = {}));
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    var Expressions;
    (function (Expressions) {
        class Stdlib {
            constructor() {
                this.expr_e = Math.E;
                this.expr_pi = Math.PI;
                this.expr_x = 0;
                this.expr_y = 0;
                this.expr_t = 0;
                this.expr_k = 0;
                this.expr_time = 0;
                this.expr_str = "";
                this.expr_estdlib = new Array(new Expressions.ELEMENT("SIN", Stdlib.expr_sin, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("COS", Stdlib.expr_cos, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("TAN", Stdlib.expr_tan, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("CTAN", Stdlib.expr_ctan, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("ASIN", Stdlib.expr_asin, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("ACOS", Stdlib.expr_acos, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("ATAN", Stdlib.expr_atan, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("ACTAN", Stdlib.expr_actan, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("SINH", Stdlib.expr_sinh, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("COSH", Stdlib.expr_cosh, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("TANH", Stdlib.expr_tanh, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("CTANH", Stdlib.expr_ctanh, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("ASINH", Stdlib.expr_asinh, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("ACOSH", Stdlib.expr_acosh, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("ATANH", Stdlib.expr_atanh, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("ACTANH", Stdlib.expr_actanh, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("EXP", Stdlib.expr_exp, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("LN", Stdlib.expr_ln, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("LOG", Stdlib.expr_log, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("LOGB", Stdlib.expr_logb, Expressions.CLib.VAL_FLOAT, 2, Expressions.CLib.VAL_FLOAT + Expressions.CLib.VAL_FLOAT * 4, 0), new Expressions.ELEMENT("SQRT", Stdlib.expr_sqrt, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("ABS", Stdlib.expr_abs, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("FLOOR", Stdlib.expr_floor, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("CEIL", Stdlib.expr_ceil, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("FRAC", Stdlib.expr_frac, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("ROUND", Stdlib.expr_round, Expressions.CLib.VAL_FLOAT, 1, Expressions.CLib.VAL_FLOAT, 0), new Expressions.ELEMENT("MIN", Stdlib.expr_min, Expressions.CLib.VAL_FLOAT, 2, Expressions.CLib.VAL_FLOAT + Expressions.CLib.VAL_FLOAT * 4, 0), new Expressions.ELEMENT("MAX", Stdlib.expr_max, Expressions.CLib.VAL_FLOAT, 2, Expressions.CLib.VAL_FLOAT + Expressions.CLib.VAL_FLOAT * 4, 0), new Expressions.ELEMENT("DIST", Stdlib.expr_dist, Expressions.CLib.VAL_FLOAT, 2, Expressions.CLib.VAL_FLOAT + Expressions.CLib.VAL_FLOAT * 4, 0), new Expressions.ELEMENT("TOUPPER", Stdlib.expr_toupper, Expressions.CLib.VAL_STR, 1, Expressions.CLib.VAL_STR, 0), new Expressions.ELEMENT("CONCAT", Stdlib.expr_concat, Expressions.CLib.VAL_STR, 2, Expressions.CLib.VAL_STR + Expressions.CLib.VAL_STR * 4, 0), new Expressions.ELEMENT("PAR", this.expr_setxy, Expressions.CLib.VAL_FLOAT, 2, 0, 0, this), new Expressions.ELEMENT("POL", this.expr_setxypol, Expressions.CLib.VAL_FLOAT, 1, 0, 0, this), new Expressions.ELEMENT("X", this.__expr_x, Expressions.CLib.VAL_FLOAT, Expressions.CLib.VAR, 0, 0, this), new Expressions.ELEMENT("Y", this.__expr_y, Expressions.CLib.VAL_FLOAT, Expressions.CLib.VAR, 0, 0, this), new Expressions.ELEMENT("T", this.__expr_t, Expressions.CLib.VAL_FLOAT, Expressions.CLib.VAR, 0, 0, this), new Expressions.ELEMENT("K", this.__expr_k, Expressions.CLib.VAL_FLOAT, Expressions.CLib.VAR, 0, 0, this), new Expressions.ELEMENT("PI", this.__expr_pi, Expressions.CLib.VAL_FLOAT, Expressions.CLib.VAR, 0, 0, this), new Expressions.ELEMENT("E", this.__expr_e, Expressions.CLib.VAL_FLOAT, Expressions.CLib.VAR, 0, 0, this), new Expressions.ELEMENT("TIME", this.__expr_time, Expressions.CLib.VAL_FLOAT, Expressions.CLib.VAR, 0, 0, this), new Expressions.ELEMENT("STR", this.__expr_str, Expressions.CLib.VAL_STR, Expressions.CLib.VAR, 0, 0, this));
            }
            static expr_sin(a) {
                return Math.sin(a);
            }
            static expr_cos(a) {
                return Math.cos(a);
            }
            static expr_tan(a) {
                return Math.tan(a);
            }
            static expr_ctan(a) {
                return 1 / Math.tan(a);
            }
            static expr_asin(a) {
                return Math.asin(a);
            }
            static expr_acos(a) {
                return Math.acos(a);
            }
            static expr_atan(a) {
                return Math.atan(a);
            }
            static expr_actan(a) {
                return Math.atan(1 / a);
            }
            static expr_sinh(a) {
                var y = Math.exp(a);
                return (y - 1 / y) / 2;
            }
            static expr_cosh(a) {
                var y = Math.exp(a);
                return (y + 1 / y) / 2;
            }
            static expr_tanh(a) {
                var a = Math.exp(+a), b = Math.exp(-a);
                return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (a + b);
            }
            static expr_ctanh(a) {
                return 1 / Stdlib.expr_tanh(a);
            }
            static expr_asinh(a) {
                if (a === -Infinity) {
                    return a;
                }
                else {
                    return Math.log(a + Math.sqrt(a * a + 1));
                }
            }
            static expr_acosh(a) {
                return Math.log(a + Math.sqrt(a * a - 1));
            }
            static expr_atanh(a) {
                return Math.log((1 + a) / (1 - a)) / 2;
            }
            static expr_actanh(a) {
                return Stdlib.expr_atanh(1 / a);
            }
            static expr_exp(a) {
                return Math.exp(a);
            }
            static expr_log(a) {
                return Math.log(a) / Math.log(10);
            }
            static expr_ln(a) {
                return Math.log(a);
            }
            static expr_logb(a, b) {
                return Math.log(a) / Math.log(b);
            }
            static expr_sqrt(a) {
                return Math.sqrt(a);
            }
            static expr_abs(a) {
                return Math.abs(a);
            }
            static expr_floor(a) {
                return Math.floor(a);
            }
            static expr_ceil(a) {
                return Math.ceil(a);
            }
            static expr_frac(a) {
                return a - Math.floor(a);
            }
            static expr_round(a) {
                return Math.round(a);
            }
            static expr_min(a, b) {
                return (a > b) ? b : a;
            }
            static expr_max(a, b) {
                return (a > b) ? a : b;
            }
            static expr_dist(a, b) {
                return Math.sqrt(a * a + b * b);
            }
            static expr_toupper(a) {
                return a.toUpperCase();
            }
            static expr_concat(a, b) {
                return a + b;
            }
            expr_setxy(fx, fy) {
                this.expr_x = fx;
                this.expr_y = fy;
                return 1;
            }
            expr_setxypol(f) {
                this.expr_x = Math.cos(this.expr_t) * f;
                this.expr_y = Math.sin(this.expr_t) * f;
                return 1;
            }
            __expr_e(...args) {
                if (args.length == 1)
                    return this.expr_e = args[0];
                else
                    return this.expr_e;
            }
            __expr_pi(...args) {
                if (args.length == 1)
                    return this.expr_pi = args[0];
                else
                    return this.expr_pi;
            }
            __expr_x(...args) {
                if (args.length == 1)
                    return this.expr_x = args[0];
                else
                    return this.expr_x;
            }
            __expr_y(...args) {
                if (args.length == 1)
                    return this.expr_y = args[0];
                else
                    return this.expr_y;
            }
            __expr_t(...args) {
                if (args.length == 1)
                    return this.expr_t = args[0];
                else
                    return this.expr_t;
            }
            __expr_k(...args) {
                if (args.length == 1)
                    return this.expr_k = args[0];
                else
                    return this.expr_k;
            }
            __expr_time(...args) {
                if (args.length == 1)
                    return this.expr_time = args[0];
                else
                    return this.expr_time;
            }
            __expr_str(...args) {
                if (args.length == 1)
                    return this.expr_str = args[0];
                else
                    return this.expr_str;
            }
            init(lib) {
                lib.addList(this.expr_estdlib);
                return lib;
            }
        }
        Expressions.Stdlib = Stdlib;
    })(Expressions = ExprAE.Expressions || (ExprAE.Expressions = {}));
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    class BiosFont8x16 {
    }
    BiosFont8x16.data = new Array(0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7E, 0x81, 0xA5, 0x81, 0x81, 0xA5, 0x99, 0x81, 0x81, 0x7E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7E, 0xFF, 0xDB, 0xFF, 0xFF, 0xDB, 0xE7, 0xFF, 0xFF, 0x7E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x6C, 0xFE, 0xFE, 0xFE, 0xFE, 0x7C, 0x38, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x38, 0x7C, 0xFE, 0x7C, 0x38, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x3C, 0x3C, 0xE7, 0xE7, 0xE7, 0x18, 0x18, 0x3C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x3C, 0x7E, 0xFF, 0xFF, 0x7E, 0x18, 0x18, 0x3C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x3C, 0x3C, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xE7, 0xC3, 0xC3, 0xE7, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3C, 0x66, 0x42, 0x42, 0x66, 0x3C, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xC3, 0x99, 0xBD, 0xBD, 0x99, 0xC3, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x1E, 0x06, 0x0E, 0x1A, 0x78, 0xCC, 0xCC, 0xCC, 0xCC, 0x78, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3C, 0x66, 0x66, 0x66, 0x66, 0x3C, 0x18, 0x7E, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3F, 0x33, 0x3F, 0x30, 0x30, 0x30, 0x30, 0x70, 0xF0, 0xE0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7F, 0x63, 0x7F, 0x63, 0x63, 0x63, 0x63, 0x67, 0xE7, 0xE6, 0xC0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0xDB, 0x3C, 0xE7, 0x3C, 0xDB, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0xC0, 0xE0, 0xF0, 0xF8, 0xFE, 0xF8, 0xF0, 0xE0, 0xC0, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x06, 0x0E, 0x1E, 0x3E, 0xFE, 0x3E, 0x1E, 0x0E, 0x06, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x3C, 0x7E, 0x18, 0x18, 0x18, 0x7E, 0x3C, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x00, 0x66, 0x66, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7F, 0xDB, 0xDB, 0xDB, 0x7B, 0x1B, 0x1B, 0x1B, 0x1B, 0x1B, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7C, 0xC6, 0x60, 0x38, 0x6C, 0xC6, 0xC6, 0x6C, 0x38, 0x0C, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0xFE, 0xFE, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x3C, 0x7E, 0x18, 0x18, 0x18, 0x7E, 0x3C, 0x18, 0x7E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x3C, 0x7E, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x7E, 0x3C, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x0C, 0xFE, 0x0C, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x60, 0xFE, 0x60, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC0, 0xC0, 0xC0, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x28, 0x6C, 0xFE, 0x6C, 0x28, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x38, 0x38, 0x7C, 0x7C, 0xFE, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0xFE, 0x7C, 0x7C, 0x38, 0x38, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x3C, 0x3C, 0x3C, 0x18, 0x18, 0x18, 0x00, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x66, 0x66, 0x66, 0x24, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x6C, 0x6C, 0xFE, 0x6C, 0x6C, 0x6C, 0xFE, 0x6C, 0x6C, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x7C, 0xC6, 0xC2, 0xC0, 0x7C, 0x06, 0x06, 0x86, 0xC6, 0x7C, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC2, 0xC6, 0x0C, 0x18, 0x30, 0x60, 0xC6, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x38, 0x6C, 0x6C, 0x38, 0x76, 0xDC, 0xCC, 0xCC, 0xCC, 0x76, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x30, 0x30, 0x60, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0C, 0x18, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x18, 0x0C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x18, 0x0C, 0x0C, 0x0C, 0x0C, 0x0C, 0x0C, 0x18, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x66, 0x3C, 0xFF, 0x3C, 0x66, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x7E, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x18, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x06, 0x0C, 0x18, 0x30, 0x60, 0xC0, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x38, 0x6C, 0xC6, 0xC6, 0xD6, 0xD6, 0xC6, 0xC6, 0x6C, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x38, 0x78, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x7E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7C, 0xC6, 0x06, 0x0C, 0x18, 0x30, 0x60, 0xC0, 0xC6, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7C, 0xC6, 0x06, 0x06, 0x3C, 0x06, 0x06, 0x06, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0C, 0x1C, 0x3C, 0x6C, 0xCC, 0xFE, 0x0C, 0x0C, 0x0C, 0x1E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0xC0, 0xC0, 0xC0, 0xFC, 0x06, 0x06, 0x06, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x38, 0x60, 0xC0, 0xC0, 0xFC, 0xC6, 0xC6, 0xC6, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0xC6, 0x06, 0x06, 0x0C, 0x18, 0x30, 0x30, 0x30, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7C, 0xC6, 0xC6, 0xC6, 0x7C, 0xC6, 0xC6, 0xC6, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7C, 0xC6, 0xC6, 0xC6, 0x7E, 0x06, 0x06, 0x06, 0x0C, 0x78, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x00, 0x00, 0x00, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x00, 0x00, 0x00, 0x18, 0x18, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x0C, 0x18, 0x30, 0x60, 0x30, 0x18, 0x0C, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7E, 0x00, 0x00, 0x7E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x60, 0x30, 0x18, 0x0C, 0x06, 0x0C, 0x18, 0x30, 0x60, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7C, 0xC6, 0xC6, 0x0C, 0x18, 0x18, 0x18, 0x00, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7C, 0xC6, 0xC6, 0xDE, 0xDE, 0xDE, 0xDC, 0xC0, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x38, 0x6C, 0xC6, 0xC6, 0xFE, 0xC6, 0xC6, 0xC6, 0xC6, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFC, 0x66, 0x66, 0x66, 0x7C, 0x66, 0x66, 0x66, 0x66, 0xFC, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3C, 0x66, 0xC2, 0xC0, 0xC0, 0xC0, 0xC0, 0xC2, 0x66, 0x3C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF8, 0x6C, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x6C, 0xF8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0x66, 0x62, 0x68, 0x78, 0x68, 0x60, 0x62, 0x66, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0x66, 0x62, 0x68, 0x78, 0x68, 0x60, 0x60, 0x60, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3C, 0x66, 0xC2, 0xC0, 0xC0, 0xDE, 0xC6, 0xC6, 0x66, 0x3A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC6, 0xC6, 0xC6, 0xC6, 0xFE, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3C, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x3C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1E, 0x0C, 0x0C, 0x0C, 0x0C, 0x0C, 0xCC, 0xCC, 0xCC, 0x78, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xE6, 0x66, 0x66, 0x6C, 0x78, 0x78, 0x6C, 0x66, 0x66, 0xE6, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0x60, 0x60, 0x60, 0x60, 0x60, 0x60, 0x62, 0x66, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC6, 0xEE, 0xFE, 0xFE, 0xD6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC6, 0xE6, 0xF6, 0xFE, 0xDE, 0xCE, 0xC6, 0xC6, 0xC6, 0xC6, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7C, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFC, 0x66, 0x66, 0x66, 0x7C, 0x60, 0x60, 0x60, 0x60, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7C, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xD6, 0xDE, 0x7C, 0x0C, 0x0E, 0x00, 0x00, 0x00, 0x00, 0xFC, 0x66, 0x66, 0x66, 0x7C, 0x6C, 0x66, 0x66, 0x66, 0xE6, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7C, 0xC6, 0xC6, 0x60, 0x38, 0x0C, 0x06, 0xC6, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7E, 0x7E, 0x5A, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x3C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0x6C, 0x38, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC6, 0xC6, 0xC6, 0xC6, 0xD6, 0xD6, 0xD6, 0xFE, 0xEE, 0x6C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC6, 0xC6, 0x6C, 0x7C, 0x38, 0x38, 0x7C, 0x6C, 0xC6, 0xC6, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x66, 0x66, 0x66, 0x66, 0x3C, 0x18, 0x18, 0x18, 0x18, 0x3C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0xC6, 0x86, 0x0C, 0x18, 0x30, 0x60, 0xC2, 0xC6, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3C, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x3C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0xC0, 0xE0, 0x70, 0x38, 0x1C, 0x0E, 0x06, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3C, 0x0C, 0x0C, 0x0C, 0x0C, 0x0C, 0x0C, 0x0C, 0x0C, 0x3C, 0x00, 0x00, 0x00, 0x00, 0x10, 0x38, 0x6C, 0xC6, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x30, 0x30, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x78, 0x0C, 0x7C, 0xCC, 0xCC, 0xCC, 0x76, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xE0, 0x60, 0x60, 0x78, 0x6C, 0x66, 0x66, 0x66, 0x66, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7C, 0xC6, 0xC0, 0xC0, 0xC0, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1C, 0x0C, 0x0C, 0x3C, 0x6C, 0xCC, 0xCC, 0xCC, 0xCC, 0x76, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7C, 0xC6, 0xFE, 0xC0, 0xC0, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x38, 0x6C, 0x64, 0x60, 0xF0, 0x60, 0x60, 0x60, 0x60, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x76, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0x7C, 0x0C, 0xCC, 0x78, 0x00, 0x00, 0x00, 0xE0, 0x60, 0x60, 0x6C, 0x76, 0x66, 0x66, 0x66, 0x66, 0xE6, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x00, 0x38, 0x18, 0x18, 0x18, 0x18, 0x18, 0x3C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x06, 0x00, 0x0E, 0x06, 0x06, 0x06, 0x06, 0x06, 0x06, 0x66, 0x66, 0x3C, 0x00, 0x00, 0x00, 0xE0, 0x60, 0x60, 0x66, 0x6C, 0x78, 0x78, 0x6C, 0x66, 0xE6, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x38, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x3C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xEC, 0xFE, 0xD6, 0xD6, 0xD6, 0xD6, 0xC6, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xDC, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7C, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xDC, 0x66, 0x66, 0x66, 0x66, 0x66, 0x7C, 0x60, 0x60, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x76, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0x7C, 0x0C, 0x0C, 0x1E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xDC, 0x76, 0x66, 0x60, 0x60, 0x60, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7C, 0xC6, 0x60, 0x38, 0x0C, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x30, 0x30, 0xFC, 0x30, 0x30, 0x30, 0x30, 0x36, 0x1C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0x76, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x66, 0x66, 0x66, 0x66, 0x66, 0x3C, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC6, 0xC6, 0xD6, 0xD6, 0xD6, 0xFE, 0x6C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC6, 0x6C, 0x38, 0x38, 0x38, 0x6C, 0xC6, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0x7E, 0x06, 0x0C, 0xF8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0xCC, 0x18, 0x30, 0x60, 0xC6, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0E, 0x18, 0x18, 0x18, 0x70, 0x18, 0x18, 0x18, 0x18, 0x0E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x18, 0x18, 0x00, 0x18, 0x18, 0x18, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x70, 0x18, 0x18, 0x18, 0x0E, 0x18, 0x18, 0x18, 0x18, 0x70, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x76, 0xDC, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x38, 0x6C, 0xC6, 0xC6, 0xC6, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3C, 0x66, 0xC2, 0xC0, 0xC0, 0xC0, 0xC2, 0x66, 0x3C, 0x0C, 0x06, 0x7C, 0x00, 0x00, 0x00, 0x00, 0xCC, 0x00, 0x00, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0x76, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0C, 0x18, 0x30, 0x00, 0x7C, 0xC6, 0xFE, 0xC0, 0xC0, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x38, 0x6C, 0x00, 0x78, 0x0C, 0x7C, 0xCC, 0xCC, 0xCC, 0x76, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xCC, 0x00, 0x00, 0x78, 0x0C, 0x7C, 0xCC, 0xCC, 0xCC, 0x76, 0x00, 0x00, 0x00, 0x00, 0x00, 0x60, 0x30, 0x18, 0x00, 0x78, 0x0C, 0x7C, 0xCC, 0xCC, 0xCC, 0x76, 0x00, 0x00, 0x00, 0x00, 0x00, 0x38, 0x6C, 0x38, 0x00, 0x78, 0x0C, 0x7C, 0xCC, 0xCC, 0xCC, 0x76, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3C, 0x66, 0x60, 0x60, 0x66, 0x3C, 0x0C, 0x06, 0x3C, 0x00, 0x00, 0x00, 0x00, 0x10, 0x38, 0x6C, 0x00, 0x7C, 0xC6, 0xFE, 0xC0, 0xC0, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC6, 0x00, 0x00, 0x7C, 0xC6, 0xFE, 0xC0, 0xC0, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x60, 0x30, 0x18, 0x00, 0x7C, 0xC6, 0xFE, 0xC0, 0xC0, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x66, 0x00, 0x00, 0x38, 0x18, 0x18, 0x18, 0x18, 0x18, 0x3C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x3C, 0x66, 0x00, 0x38, 0x18, 0x18, 0x18, 0x18, 0x18, 0x3C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x60, 0x30, 0x18, 0x00, 0x38, 0x18, 0x18, 0x18, 0x18, 0x18, 0x3C, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC6, 0x00, 0x10, 0x38, 0x6C, 0xC6, 0xC6, 0xFE, 0xC6, 0xC6, 0xC6, 0x00, 0x00, 0x00, 0x00, 0x38, 0x6C, 0x38, 0x00, 0x38, 0x6C, 0xC6, 0xC6, 0xFE, 0xC6, 0xC6, 0xC6, 0x00, 0x00, 0x00, 0x00, 0x18, 0x30, 0x60, 0x00, 0xFE, 0x66, 0x60, 0x7C, 0x60, 0x60, 0x66, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xCC, 0x76, 0x36, 0x7E, 0xD8, 0xD8, 0x6E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 0x6C, 0xCC, 0xCC, 0xFE, 0xCC, 0xCC, 0xCC, 0xCC, 0xCE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x38, 0x6C, 0x00, 0x7C, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC6, 0x00, 0x00, 0x7C, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x60, 0x30, 0x18, 0x00, 0x7C, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x78, 0xCC, 0x00, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0x76, 0x00, 0x00, 0x00, 0x00, 0x00, 0x60, 0x30, 0x18, 0x00, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0x76, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC6, 0x00, 0x00, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0x7E, 0x06, 0x0C, 0x78, 0x00, 0x00, 0xC6, 0x00, 0x7C, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC6, 0x00, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x3C, 0x66, 0x60, 0x60, 0x60, 0x66, 0x3C, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x38, 0x6C, 0x64, 0x60, 0xF0, 0x60, 0x60, 0x60, 0x60, 0xE6, 0xFC, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x66, 0x66, 0x3C, 0x18, 0x7E, 0x18, 0x7E, 0x18, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF8, 0xCC, 0xCC, 0xF8, 0xC4, 0xCC, 0xDE, 0xCC, 0xCC, 0xCC, 0xC6, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0E, 0x1B, 0x18, 0x18, 0x18, 0x7E, 0x18, 0x18, 0x18, 0x18, 0x18, 0xD8, 0x70, 0x00, 0x00, 0x00, 0x18, 0x30, 0x60, 0x00, 0x78, 0x0C, 0x7C, 0xCC, 0xCC, 0xCC, 0x76, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0C, 0x18, 0x30, 0x00, 0x38, 0x18, 0x18, 0x18, 0x18, 0x18, 0x3C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x30, 0x60, 0x00, 0x7C, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x30, 0x60, 0x00, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0x76, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x76, 0xDC, 0x00, 0xDC, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x00, 0x00, 0x00, 0x00, 0x76, 0xDC, 0x00, 0xC6, 0xE6, 0xF6, 0xFE, 0xDE, 0xCE, 0xC6, 0xC6, 0xC6, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3C, 0x6C, 0x6C, 0x3E, 0x00, 0x7E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x38, 0x6C, 0x6C, 0x38, 0x00, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x30, 0x00, 0x30, 0x30, 0x60, 0xC0, 0xC6, 0xC6, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0xC0, 0xC0, 0xC0, 0xC0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0x06, 0x06, 0x06, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC0, 0xC0, 0xC2, 0xC6, 0xCC, 0x18, 0x30, 0x60, 0xDC, 0x86, 0x0C, 0x18, 0x3E, 0x00, 0x00, 0x00, 0xC0, 0xC0, 0xC2, 0xC6, 0xCC, 0x18, 0x30, 0x66, 0xCE, 0x9E, 0x3E, 0x06, 0x06, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x00, 0x18, 0x18, 0x18, 0x3C, 0x3C, 0x3C, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x36, 0x6C, 0xD8, 0x6C, 0x36, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xD8, 0x6C, 0x36, 0x6C, 0xD8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x11, 0x44, 0x11, 0x44, 0x11, 0x44, 0x11, 0x44, 0x11, 0x44, 0x11, 0x44, 0x11, 0x44, 0x11, 0x44, 0x55, 0xAA, 0x55, 0xAA, 0x55, 0xAA, 0x55, 0xAA, 0x55, 0xAA, 0x55, 0xAA, 0x55, 0xAA, 0x55, 0xAA, 0xDD, 0x77, 0xDD, 0x77, 0xDD, 0x77, 0xDD, 0x77, 0xDD, 0x77, 0xDD, 0x77, 0xDD, 0x77, 0xDD, 0x77, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0xF8, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0xF8, 0x18, 0xF8, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0xF6, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF8, 0x18, 0xF8, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x36, 0x36, 0x36, 0x36, 0x36, 0xF6, 0x06, 0xF6, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0x06, 0xF6, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0xF6, 0x06, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x18, 0x18, 0x18, 0xF8, 0x18, 0xF8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF8, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x1F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x1F, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0xFF, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x1F, 0x18, 0x1F, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x37, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x37, 0x30, 0x3F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3F, 0x30, 0x37, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0xF7, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0xF7, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x37, 0x30, 0x37, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x36, 0x36, 0x36, 0x36, 0x36, 0xF7, 0x00, 0xF7, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x18, 0x18, 0x18, 0x18, 0x18, 0xFF, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0xFF, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x3F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x18, 0x18, 0x18, 0x1F, 0x18, 0x1F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1F, 0x18, 0x1F, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3F, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0xFF, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x36, 0x18, 0x18, 0x18, 0x18, 0x18, 0xFF, 0x18, 0xFF, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0xF8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1F, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0x0F, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x76, 0xDC, 0xD8, 0xD8, 0xD8, 0xDC, 0x76, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x78, 0xCC, 0xCC, 0xCC, 0xD8, 0xCC, 0xC6, 0xC6, 0xC6, 0xCC, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0xC6, 0xC6, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0x6C, 0x6C, 0x6C, 0x6C, 0x6C, 0x6C, 0x6C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0xC6, 0x60, 0x30, 0x18, 0x30, 0x60, 0xC6, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7E, 0xD8, 0xD8, 0xD8, 0xD8, 0xD8, 0x70, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x66, 0x66, 0x66, 0x66, 0x66, 0x7C, 0x60, 0x60, 0xC0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x76, 0xDC, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7E, 0x18, 0x3C, 0x66, 0x66, 0x66, 0x3C, 0x18, 0x7E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x38, 0x6C, 0xC6, 0xC6, 0xFE, 0xC6, 0xC6, 0x6C, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x38, 0x6C, 0xC6, 0xC6, 0xC6, 0x6C, 0x6C, 0x6C, 0x6C, 0xEE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1E, 0x30, 0x18, 0x0C, 0x3E, 0x66, 0x66, 0x66, 0x66, 0x3C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7E, 0xDB, 0xDB, 0xDB, 0x7E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x06, 0x7E, 0xDB, 0xDB, 0xF3, 0x7E, 0x60, 0xC0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1C, 0x30, 0x60, 0x60, 0x7C, 0x60, 0x60, 0x60, 0x30, 0x1C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7C, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0x00, 0x00, 0xFE, 0x00, 0x00, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x7E, 0x18, 0x18, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x18, 0x0C, 0x06, 0x0C, 0x18, 0x30, 0x00, 0x7E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0C, 0x18, 0x30, 0x60, 0x30, 0x18, 0x0C, 0x00, 0x7E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0E, 0x1B, 0x1B, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0xD8, 0xD8, 0xD8, 0x70, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x00, 0x7E, 0x00, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x76, 0xDC, 0x00, 0x76, 0xDC, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x38, 0x6C, 0x6C, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0F, 0x0C, 0x0C, 0x0C, 0x0C, 0x0C, 0xEC, 0x6C, 0x6C, 0x3C, 0x1C, 0x00, 0x00, 0x00, 0x00, 0x00, 0xD8, 0x6C, 0x6C, 0x6C, 0x6C, 0x6C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x70, 0xD8, 0x30, 0x60, 0xC8, 0xF8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7C, 0x7C, 0x7C, 0x7C, 0x7C, 0x7C, 0x7C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
    ExprAE.BiosFont8x16 = BiosFont8x16;
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    var Drawing;
    (function (Drawing) {
        class CTex {
            constructor() {
                this.b = [];
            }
            Load(bf, width, height) {
                var wsk;
                var pwsk;
                var sw = 1, lw = 0;
                while ((sw < width) && (lw < CTex.MAXMIPMAPS)) {
                    sw <<= 1;
                    lw++;
                }
                var sh = 1, lh = 0;
                while ((sh < height) && (lh < CTex.MAXMIPMAPS)) {
                    sh <<= 1;
                    lh++;
                }
                var s;
                if (sw > sh) {
                    s = sw;
                    this.shift = lw;
                }
                else {
                    s = sh;
                    this.shift = lh;
                }
                var j = s;
                for (var i = 0; i <= this.shift; i++) {
                    this.b[i] = new Uint32Array(j * j);
                    j >>= 1;
                }
                this.x0 = 0;
                this.y0 = 0;
                if ((width != s) || (height != s)) {
                    wsk = this.b[0];
                    var wskl = 0;
                    var dx = width / s;
                    var dy = height / s;
                    var x;
                    var y = 0;
                    var r, g, b;
                    for (var j = 0; j < s - 1; j++) {
                        x = 0;
                        for (var i = 0; i < s - 1; i++) {
                            var d = (((x | 0) + (y | 0) * width)) << 2;
                            var x1 = x - Math.floor(x), y1 = y - Math.floor(y);
                            var b1 = bf[d];
                            var b2 = bf[d + 4];
                            var b3 = bf[d + width * 4 + 4];
                            var b4 = bf[d + width * 4];
                            var g1 = bf[d + 1];
                            var g2 = bf[d + 4 + 1];
                            var g3 = bf[d + width * 4 + 4 + 1];
                            var g4 = bf[d + width * 4 + 1];
                            var r1 = bf[d + 2];
                            var r2 = bf[d + 4 + 2];
                            var r3 = bf[d + width * 4 + 4 + 2];
                            var r4 = bf[d + width * 4 + 2];
                            if (!r3)
                                r3 = r2;
                            if (!r4)
                                r4 = r1;
                            if (!g3)
                                g3 = g2;
                            if (!g4)
                                g4 = g1;
                            if (!b3)
                                b3 = b2;
                            if (!b4)
                                b4 = b1;
                            r = ((r1 * (1 - x1) + r2 * x1) * (1 - y1) + (r3 * x1 + r4 * (1 - x1)) * y1) | 0;
                            g = ((g1 * (1 - x1) + g2 * x1) * (1 - y1) + (g3 * x1 + g4 * (1 - x1)) * y1) | 0;
                            b = ((b1 * (1 - x1) + b2 * x1) * (1 - y1) + (b3 * x1 + b4 * (1 - x1)) * y1) | 0;
                            wsk[wskl] = ExprAE.D.RGB32(r, g, b);
                            wskl++;
                            x += dx;
                        }
                        let ind = (((x | 0) + (y | 0) * width)) << 2;
                        wsk[wskl] = ExprAE.D.RGB32(bf[ind + 2], bf[ind + 1], bf[ind]);
                        wskl++;
                        y += dy;
                    }
                    x = 0;
                    for (var i = 0; i < s; i++) {
                        let ind = (((x | 0) + (y | 0) * width)) << 2;
                        wsk[wskl] = ExprAE.D.RGB32(bf[ind + 2], bf[ind + 1], bf[ind]);
                        wskl++;
                        x += dx;
                    }
                    this.SetParameters(this.x0, this.y0, 1, dy / dx);
                }
                else {
                    this.b[0] = new Uint32Array(bf.buffer);
                    this.SetParameters(this.x0, this.y0, 1, 1);
                }
                this.width = height = s;
                this.BuildMipMaps(this.b, width, this.shift);
                return 1;
            }
            IsLoaded() { return this.b[0] != null; }
            GetU(x) { return (x - this.x0) * this.w; }
            GetV(y) { return (y - this.y0) * this.h; }
            GetSize(lev) { return this.width >> lev; }
            GetMaxLev() { return this.shift; }
            SetPeekLev(lev) { this.peekbuf = this.b[lev]; this.peekshift = (this.shift - lev); this.peekmask = (1 << (this.shift - lev)) - 1; }
            Peek(u, v) {
                return this.peekbuf[((u & this.peekmask) + ((v & this.peekmask) << this.peekshift))];
            }
            SetParameters(a, b, c, d) {
                this.x0 = a;
                this.y0 = b;
                this.w = 1 / c;
                this.h = 1 / d;
            }
            BuildMipMaps(tbuf, twidth, tshift) {
                var wsk, pwsk;
                var wskl, pwskl;
                var j;
                j = twidth >> 1;
                for (var i = 1; i <= tshift; i++) {
                    wsk = tbuf[i];
                    wskl = 0;
                    for (var y = 0; y < j; y++) {
                        pwsk = tbuf[i - 1];
                        pwskl = (j << 2) * y;
                        for (var x = 0; x < j; x++) {
                            var c1 = pwsk[pwskl];
                            var c2 = pwsk[pwskl + 1];
                            var c3 = pwsk[pwskl + (j << 1)];
                            var c4 = pwsk[pwskl + (j << 1) + 1];
                            var sr = (((c1 >> 16) & 255) + ((c2 >> 16) & 255) + ((c3 >> 16) & 255) + ((c4 >> 16) & 255)) / 4;
                            var sg = (((c1 >> 8) & 255) + ((c2 >> 8) & 255) + ((c3 >> 8) & 255) + ((c4 >> 8) & 255)) / 4;
                            var sb = (((c1) & 255) + ((c2) & 255) + ((c3) & 255) + ((c4) & 255)) / 4;
                            var sa = (((c1 >> 24) & 255) + ((c2 >> 24) & 255) + ((c3 >> 24) & 255) + ((c4 >> 24) & 255)) / 4;
                            wsk[wskl] = (sa << 24) + (sr << 16) + (sg << 8) + sb;
                            wskl++;
                            pwskl += 2;
                        }
                    }
                    j >>= 1;
                }
            }
        }
        CTex.MAXMIPMAPS = 16;
        Drawing.CTex = CTex;
    })(Drawing = ExprAE.Drawing || (ExprAE.Drawing = {}));
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    var Drawing;
    (function (Drawing) {
        class ExprImg {
            static getTexture() {
                var tex = new Drawing.CTex();
                var array = new Uint32Array(ExprImg.data);
                tex.Load(new Uint8Array(array.buffer), ExprImg.EXPRIMG_WIDTH, ExprImg.EXPRIMG_HEIGHT);
                return tex;
            }
        }
        ExprImg.EXPRIMG_WIDTH = 64;
        ExprImg.EXPRIMG_HEIGHT = 32;
        ExprImg.data = new Array(0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF8C8C8C, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF686868, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF8C8C8C, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF7C7C7C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF8C8C8C, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF7C7C7C, 0xFFD9D9D9, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF8C8C8C, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF9A9A9A, 0xFFE1E1E1, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF7C7C7C, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFFB2B2B2, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF7C7C7C, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF8C8C8C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF7C7C7C, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFFD0D0D0, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF7C7C7C, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFFD9D9D9, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF8C8C8C, 0xFF000000, 0xFFD9D9D9, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF8C8C8C, 0xFF000000, 0xFFD9D9D9, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF4D4D4D, 0xFF000000, 0xFFE1E1E1, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFA7A7A7, 0xFF4D4D4D, 0xFFE9E9E9, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFB2B2B2, 0xFF000000, 0xFFBDBDBD, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFF0F0F0, 0xFF9A9A9A, 0xFF000000, 0xFF686868, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF8C8C8C, 0xFF000000, 0xFFD9D9D9, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFE9E9E9, 0xFF7C7C7C, 0xFF000000, 0xFF7C7C7C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF4D4D4D, 0xFF000000, 0xFFE1E1E1, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF4D4D4D, 0xFF000000, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFD9D9D9, 0xFF000000, 0xFF686868, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFA7A7A7, 0xFF4D4D4D, 0xFFE9E9E9, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF8C8C8C, 0xFF000000, 0xFFE1E1E1, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF000000, 0xFF000000, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF4D4D4D, 0xFF000000, 0xFFE1E1E1, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF000000, 0xFF000000, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFF0F0F0, 0xFF000000, 0xFF000000, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFA7A7A7, 0xFF7C7C7C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF686868, 0xFFB2B2B2, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF9A9A9A, 0xFF000000, 0xFFB2B2B2, 0xFFFFFFFF, 0xFF8C8C8C, 0xFF000000, 0xFFD9D9D9, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF000000, 0xFF000000, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF000000, 0xFF686868, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFF0F0F0, 0xFF000000, 0xFF000000, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFF0F0F0, 0xFF000000, 0xFF4D4D4D, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFE1E1E1, 0xFF000000, 0xFF000000, 0xFFFFFFFF, 0xFFF0F0F0, 0xFF000000, 0xFF686868, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF4D4D4D, 0xFF000000, 0xFF686868, 0xFF000000, 0xFFD0D0D0, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFE9E9E9, 0xFF000000, 0xFF686868, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFA7A7A7, 0xFF000000, 0xFFBDBDBD, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFE1E1E1, 0xFF000000, 0xFF4D4D4D, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF9A9A9A, 0xFF000000, 0xFFBDBDBD, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFBDBDBD, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFFA7A7A7, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFD0D0D0, 0xFF000000, 0xFF000000, 0xFFD0D0D0, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFC7C7C7, 0xFF000000, 0xFF9A9A9A, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFD9D9D9, 0xFF8C8C8C, 0xFF000000, 0xFF7C7C7C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFBDBDBD, 0xFF000000, 0xFF8C8C8C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFE9E9E9, 0xFFBDBDBD, 0xFF4D4D4D, 0xFF000000, 0xFF7C7C7C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF9A9A9A, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFFC7C7C7, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFE9E9E9, 0xFF7C7C7C, 0xFF000000, 0xFF000000, 0xFFC7C7C7, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFA7A7A7, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF8C8C8C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF9A9A9A, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFFB2B2B2, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF686868, 0xFF000000, 0xFFE1E1E1, 0xFFFFFFFF, 0xFF4D4D4D, 0xFF000000, 0xFFE9E9E9, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFE9E9E9, 0xFF4D4D4D, 0xFF000000, 0xFFBDBDBD, 0xFF4D4D4D, 0xFF4D4D4D, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF7C7C7C, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF4D4D4D, 0xFF9A9A9A, 0xFFD9D9D9, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF686868, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFFD9D9D9, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF000000, 0xFF000000, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF7C7C7C, 0xFF9A9A9A, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFB2B2B2, 0xFF686868, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFE9E9E9, 0xFF4D4D4D, 0xFF4D4D4D, 0xFFE1E1E1, 0xFFFFFFFF, 0xFFC7C7C7, 0xFF000000, 0xFF9A9A9A, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF000000, 0xFF000000, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF000000, 0xFF000000, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF9A9A9A, 0xFF000000, 0xFF7C7C7C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFE1E1E1, 0xFF000000, 0xFF7C7C7C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF000000, 0xFF686868, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFD0D0D0, 0xFF4D4D4D, 0xFF4D4D4D, 0xFFE9E9E9, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF8C8C8C, 0xFF000000, 0xFFD9D9D9, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFE1E1E1, 0xFF000000, 0xFF8C8C8C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFE1E1E1, 0xFF000000, 0xFF8C8C8C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFE9E9E9, 0xFF000000, 0xFF000000, 0xFFD0D0D0, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFC7C7C7, 0xFF000000, 0xFFA7A7A7, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFE9E9E9, 0xFF000000, 0xFFA7A7A7, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFD0D0D0, 0xFF000000, 0xFF4D4D4D, 0xFFE9E9E9, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFE9E9E9, 0xFF000000, 0xFF686868, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFBDBDBD, 0xFF000000, 0xFFB2B2B2, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFC7C7C7, 0xFF000000, 0xFFBDBDBD, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF8C8C8C, 0xFF000000, 0xFF7C7C7C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF8C8C8C, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFFD0D0D0, 0xFF8C8C8C, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF7C7C7C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF8C8C8C, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF7C7C7C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF8C8C8C, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF7C7C7C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFE1E1E1, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF7C7C7C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF7C7C7C, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFFF0F0F0, 0xFF7C7C7C, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF8C8C8C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF7C7C7C, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF8C8C8C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFF7C7C7C, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF000000, 0xFF8C8C8C, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFB2B2B2, 0xFF000000, 0xFF000000, 0xFFA7A7A7, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF);
        Drawing.ExprImg = ExprImg;
    })(Drawing = ExprAE.Drawing || (ExprAE.Drawing = {}));
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    class Font3x5 {
    }
    Font3x5.data = new Array(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0);
    ExprAE.Font3x5 = Font3x5;
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    var Console;
    (function (Console) {
        var keys = ExprAE.System.Keys;
        var keyMap = ExprAE.System.KeyMap;
        var csys = ExprAE.System.CSys;
        class CCon extends ExprAE.Drawing.CWin {
            constructor(width, height, buf, reffunc, libwin) {
                super(width, height, buf);
                this.width = width;
                this.height = height;
                this.buf = buf;
                this.reffunc = reffunc;
                this.libwin = libwin;
                this.lines = [];
                this.edit = [];
                this.prompt = null;
                this.wskl = 0;
                this.wsklv = 0;
                this.wske = 0;
                this.wskh = 0;
                this.colshf = 0;
                this.ecursor = 0;
                this.elen = 0;
                this.estart = 0;
                this.echo = 0;
                this.fexecsl = -1;
                this.libwinon = 0;
                this.edit[0] = "";
            }
            Edit(c) {
                var w = this.wske % CCon.EDIT;
                if (!this.edit[w])
                    this.edit[w] = "";
                if ((c.charCodeAt(0) == keyMap.BACKSPACE) && (this.elen > 0) && (this.ecursor > 0)) {
                    this.edit[w] = this.edit[w].slice(0, this.ecursor - 1) + this.edit[w].slice(this.ecursor, this.elen);
                    this.elen--;
                    this.ecursor--;
                }
                else if ((c.charCodeAt(0) == keyMap.DELETE) && (this.elen > 0) && (this.ecursor != this.elen)) {
                    this.edit[w] = this.edit[w].slice(0, this.ecursor) + this.edit[w].slice(this.ecursor + 1, this.elen);
                    this.elen--;
                }
                else if (c == '\n')
                    this.Enter();
                else if ((c.charCodeAt(0) != keyMap.DELETE) && (c.charCodeAt(0) != keyMap.BACKSPACE) && (this.elen < CCon.BUFLEN - 1) && (c.charCodeAt(0) >= 32)) {
                    if (this.ecursor == this.elen) {
                        this.edit[w] = this.edit[w] + c;
                        this.ecursor++;
                    }
                    else {
                        this.edit[w] = this.edit[w].slice(0, this.ecursor) + c + this.edit[w].slice(this.ecursor, this.elen);
                        this.ecursor++;
                    }
                    this.elen++;
                }
            }
            Enter() {
                var edited = this.edit[this.wske % CCon.EDIT];
                if (!edited)
                    return;
                var bf = this.reffunc(edited) + "";
                if (!bf) {
                    this.lines[this.wskl % CCon.LINES], this.edit[this.wske % CCon.EDIT];
                }
                else {
                    var l = 0, l2 = 0;
                    var sl = bf.length;
                    var bufl;
                    while (l < sl) {
                        while (l < bf.length && (bf[l] != '\n'))
                            l++;
                        this.lines[this.wskl % CCon.LINES] = bf.slice(0, l);
                        l2 = ++l;
                        this.wskl++;
                    }
                    this.wskl--;
                }
                this.
                    wskl++;
                if (this.wske > 0) {
                    if (this.edit[this.wske % CCon.EDIT] === this.edit[(this.wske - 1) % CCon.EDIT])
                        this.wske--;
                }
                this.wske++;
                this.edit[this.wske % CCon.EDIT] = "";
                this.ecursor = this.elen = 0;
                this.wskh = this.wske;
                this.wsklv = this.wskl;
                this.estart = 0;
                this.colshf = 0;
            }
            KeyFunc(k) {
                var shift = k & keys.SHIFT;
                if (csys.MouseKeyPressed(keys.M_LEFT))
                    k |= keys.K_ENTER;
                if (csys.MouseKeyPressed(keys.M_RIGHT))
                    k |= keys.K_ESCAPE;
                k &= keys.REGULAR;
                if (k == keys.K_TAB) {
                    if (!this.libwinon) {
                        this.libwinon = 1;
                        this.libwin.Clear();
                        this.libwin.Set("");
                    }
                    else {
                        this.libwin.KeyFunc(k);
                    }
                }
                else if (k == keys.K_ESCAPE) {
                    if (this.libwinon)
                        this.libwinon = 0;
                    else {
                        this.edit[this.wske % CCon.EDIT] = "";
                        this.ecursor = this.elen = 0;
                        this.wskh = this.wske;
                        this.estart = 0;
                    }
                }
                else if (k == keys.K_LEFT) {
                    if (shift) {
                        if (this.colshf > 0)
                            this.colshf--;
                    }
                    else if (this.ecursor > 0)
                        this.ecursor--;
                }
                else if (k == keys.K_RIGHT) {
                    if (shift)
                        this.colshf++;
                    else if (this.ecursor < this.elen)
                        this.ecursor++;
                }
                else if (k == keys.K_HOME)
                    this.ecursor = 0;
                else if (k == keys.K_END)
                    this.ecursor = this.elen;
                else if (k == keys.K_UP && !this.libwinon) {
                    if (this.wskh > 0)
                        this.edit[this.wske % CCon.EDIT] = this.edit[(--this.wskh) % CCon.EDIT];
                    this.ecursor = this.elen = this.edit[this.wske % CCon.EDIT].length;
                    this.estart = 0;
                }
                else if (k == keys.K_DOWN && !this.libwinon) {
                    if (this.wskh < this.wske - 1)
                        this.edit[this.wske % CCon.EDIT] = this.edit[(++this.wskh) % CCon.EDIT];
                    else if (this.wskh < this.wske) {
                        this.edit[this.wske % CCon.EDIT] = "";
                        this.wskh++;
                    }
                    this.ecursor = this.elen = this.edit[this.wske % CCon.EDIT].length;
                    this.estart = 0;
                }
                else if (k == keys.K_PAGE_UP) {
                    if (this.wsklv > 0)
                        this.wsklv--;
                }
                else if (k == keys.K_PAGE_DOWN) {
                    if (this.wsklv < this.wskl)
                        this.wsklv++;
                }
                else if ((k == keys.K_ENTER) && (shift)) {
                }
                else {
                    var c = '\0';
                    for (var i = 0; i < keyMap.KEYMAPLEN; i++) {
                        if (keyMap.data[i * 3] == k.valueOf()) {
                            c = keyMap.data[i * 3 + (shift ? 1 : 0) + 1];
                            break;
                        }
                    }
                    if (this.libwinon && c != "*" && c != "/" && c != "+" && c != "-" && !(c >= '0' && c <= '9')) {
                        this.libwin.KeyFunc(k);
                        var i = 0;
                        if (this.libwin.retbuf.length > 0) {
                            var prevCursorPos = this.ecursor;
                            while (i < this.libwin.retbuf.length) {
                                this.Edit(this.libwin.retbuf[i++]);
                            }
                            var setCurPos = this.libwin.retbuf.indexOf("(");
                            if (setCurPos != -1)
                                this.ecursor = prevCursorPos + setCurPos + 1;
                            this.libwin.retbuf = "";
                        }
                    }
                    else {
                        if (c == '\n')
                            this.Enter();
                        else if (c.charCodeAt(0) != 0)
                            this.Edit(c);
                    }
                }
                if ((this.ecursor - this.estart) < 0)
                    this.estart = this.ecursor;
                var ewidth = (this.width - this.fontwidth) / this.fontwidth - (this.prompt ? this.prompt.length : 0);
                if (this.ecursor - this.estart >= ewidth)
                    this.estart = this.ecursor - ewidth + 1;
            }
            Process() {
                this.Clear();
                this.HLine(0, this.height - this.fontheight - 4, this.width - 1, csys.Color[csys.CFaded]);
                var plen = 1;
                if (this.prompt) {
                    plen += this.prompt.length * this.fontwidth;
                }
                var ewidth = (this.width - this.fontwidth) / this.fontwidth - (this.prompt ? this.prompt.length : 0);
                this.DrawTextHighlighted(-this.estart * this.fontwidth + plen, this.height - this.fontheight - 2, csys.Color[csys.CHighlighted], 255, this.edit[this.wske % CCon.EDIT]);
                if ((csys.GetTime() * 1000) % (CCon.CURSORINTERVAL * 2) < CCon.CURSORINTERVAL)
                    this.DrawText((this.ecursor - this.estart) * this.fontwidth + plen, this.height - this.fontheight - 1, csys.Color[csys.CHighlighted], "_");
                if (this.prompt) {
                    this.Bar(0, this.height - this.fontheight - 2, plen - 1, this.height - 1, csys.Color[csys.CPattern]);
                    this.DrawText(1, this.height - this.fontheight - 2, this.FadeColor(ExprAE.D.RGB32(255, 255, 255), 128), this.prompt);
                }
                var y = this.height - 2 * this.fontheight - 4;
                var l, i;
                i = this.wsklv - 1;
                l = y / this.fontheight + 1;
                if (l > CCon.LINES)
                    l = CCon.LINES;
                if (l > this.wsklv)
                    l = this.wsklv;
                while (l--) {
                    if (this.colshf > 0) {
                        this.DrawTextHighlighted(1 - (this.colshf - 1) * this.fontwidth, y, csys.Color[csys.CNormal], 220, this.lines[i % CCon.LINES]);
                    }
                    else
                        this.DrawTextHighlighted(1, y, csys.Color[csys.CNormal], 220, this.lines[i % CCon.LINES]);
                    i--;
                    y -= this.fontheight;
                }
                if (this.colshf > 0) {
                    y = this.height - 2 * this.fontheight - 4;
                    while (y >= 0) {
                        this.Bar(0, y, this.fontwidth, y + this.fontheight - 1, csys.Color[csys.CPattern]);
                        this.DrawText(1, y, csys.Color[csys.CNormal], "<");
                        y -= this.fontheight;
                    }
                }
                if (this.libwinon)
                    this.libwin.Draw();
            }
            Put(s) {
                var l = 0, l2 = 0;
                var sl = s.length;
                var bufl;
                while (l < sl) {
                    while (l < sl && (s[l] != '\n'))
                        l++;
                    this.lines[this.wskl % CCon.LINES] = s.slice(l2, l);
                    l2 = ++l;
                    this.wskl++;
                }
                this.wsklv = this.wskl;
            }
            Exec(s) {
                this.edit[this.wske % CCon.EDIT] = s;
                this.Enter();
            }
        }
        CCon.BUFLEN = 256;
        CCon.LINES = 256;
        CCon.EDIT = 128;
        CCon.CURSORINTERVAL = 500;
        CCon.MAXEXECFILES = 8;
        Console.CCon = CCon;
    })(Console = ExprAE.Console || (ExprAE.Console = {}));
})(ExprAE || (ExprAE = {}));
var ExprAE;
(function (ExprAE) {
    var Console;
    (function (Console) {
        var keys = ExprAE.System.Keys;
        var keyMap = ExprAE.System.KeyMap;
        class CLibWin extends ExprAE.Drawing.CWin {
            constructor(w, h, b, x1, y1, x2, y2, lib) {
                super(w, h, b);
                this.x1 = x1;
                this.y1 = y1;
                this.x2 = x2;
                this.y2 = y2;
                this.lib = lib;
                this.lines = ((y2 - y1) / CLibWin.CWCHARHEIGHT) | 0;
                this.pos = this.npos = this.lpos = 0;
                this.ebuf = "";
                this.x10 = x1;
                this.y10 = y1;
                this.x20 = x2;
                this.y20 = y2;
                this.w0 = w;
                this.h0 = h;
                this.retbuf = "";
            }
            Change(buf, width, height) {
                var dw = width / this.w0, dh = height / this.h0;
                super.Change(buf, width, height);
                this.x1 = this.x10 * dw;
                this.x2 = (this.x20 * dw);
                this.y1 = (this.y10 * dh);
                this.y2 = (this.y20 * dh);
                this.lines = ((this.y2 - this.y1) / CLibWin.CWCHARHEIGHT) | 0;
                this.pos = this.lpos = 0;
                this.Set(this.ebuf);
            }
            KeyFunc(k) {
                if (k == keys.K_DOWN) {
                    this.pos++;
                }
                else if (k == keys.K_UP) {
                    this.pos--;
                }
                else if (k == keys.K_ENTER || k == keys.K_TAB) {
                    var pom;
                    if (this.tbuf.length == 0)
                        return;
                    pom = this.tbuf;
                    var k = 0, j = 0;
                    for (var i = 0; i < this.pos; i++) {
                        while (pom[j] != '\n')
                            j++;
                        k = j + 1;
                        j++;
                    }
                    while (pom[j] != '\n')
                        j++;
                    pom = pom.slice(0, j);
                    this.retbuf = pom.slice(k);
                    var n;
                    n = this.lib.find(this.retbuf);
                    if ((n.parattr & 0x80000000) == 0) {
                        this.retbuf += "(";
                        k = (n.parattr & 0xff) - 1;
                        for (var i = 0; i < k; i++) {
                            if (this.lib.getPar(n.partypes, i) == ExprAE.Expressions.CLib.VAL_STR)
                                this.retbuf += '""';
                            this.retbuf += ",";
                        }
                        if (this.lib.getPar(n.partypes, i) == ExprAE.Expressions.CLib.VAL_STR)
                            this.retbuf += '""';
                        this.retbuf += ")";
                    }
                    this.Clear();
                    this.Set("");
                }
                else {
                    var c = "\0";
                    {
                        for (var i = 0; i < keyMap.KEYMAPLEN; i++) {
                            if (keyMap.data[i * 3] == (k & 255)) {
                                c = keyMap.data[i * 3 + 2];
                                break;
                            }
                        }
                        var l = this.ebuf.length;
                        if ((c.charCodeAt(0) == 8) || (c.charCodeAt(0) == 127)) {
                            l -= 2;
                            while ((this.ebuf[l] != '|') && (l >= 0))
                                l--;
                            this.ebuf = this.ebuf.slice(0, l + 1);
                        }
                        else if (this.lib.index(c) != -1) {
                            this.ebuf = this.ebuf.slice(0, l + 1) + c + '|';
                        }
                    }
                    this.Set(this.ebuf);
                }
                if (this.pos < 0)
                    this.pos = this.npos - 1;
                if (this.pos >= this.npos)
                    this.pos = 0;
                if (this.pos - this.lpos >= this.lines) {
                    this.lpos = this.pos - this.lines + 1;
                }
                if (this.pos - this.lpos < 0) {
                    this.lpos = this.pos;
                }
            }
            Set(t) {
                this.pos = this.lpos = 0;
                var res = this.lib.NListFromTxt(t, '|');
                this.tbuf = res.ret.replace(/\|/g, "\n");
                this.npos = res.w;
            }
            Draw() {
                var cpos = this.pos - this.lpos;
                var j = 0, k = 0;
                var x = this.x1, y = this.y1;
                var cposx, cposy;
                cposx = ExprAE.System.CSys.getMouseX();
                cposy = ExprAE.System.CSys.getMouseY();
                if ((cposx != CLibWin.pcposx) || (cposy != CLibWin.pcposy)) {
                    var d = 0;
                    if (cposy < this.y1)
                        d = -1;
                    if (cposy > this.y2 - CLibWin.CWCHARHEIGHT)
                        d = 1;
                    if (d != 0)
                        this.pos += d;
                    else
                        this.pos = Math.round((cposy - this.y1) / CLibWin.CWCHARHEIGHT) + this.lpos;
                    CLibWin.pcposx = cposx;
                    CLibWin.pcposy = cposy;
                    if (this.pos < 0)
                        this.pos = 0;
                    if (this.pos >= this.npos)
                        this.pos = this.npos - 1;
                    if (this.pos - this.lpos >= this.lines) {
                        this.lpos = this.pos - this.lines + 1;
                    }
                    if (this.pos - this.lpos < 0) {
                        this.lpos = this.pos;
                    }
                }
                this.Bar(this.x1, this.y1, this.x2, this.y2, ExprAE.System.CSys.Color[ExprAE.System.CSys.CPattern]);
                this.Bar(this.x1, this.y1 + cpos * CLibWin.CWCHARHEIGHT, this.x2, this.y1 + (cpos + 1) * CLibWin.CWCHARHEIGHT, ExprAE.System.CSys.Color[ExprAE.System.CSys.CFavour]);
                var cnpos = (this.npos > this.lines) ? this.lines : this.npos;
                var pomlines = this.tbuf.split("\n");
                for (var i = 0; i < cnpos; i++) {
                    this.DrawText(x, y, ExprAE.System.CSys.Color[ExprAE.System.CSys.CHelp], pomlines[i + this.lpos]);
                    y += CLibWin.CWCHARHEIGHT;
                }
            }
            Clear() {
                this.ebuf = "";
            }
        }
        CLibWin.CWCHARHEIGHT = 8;
        CLibWin.Num2Char = new Array("ABC", "DEF", "GHI", "JKL", "MNO", "PQRS", "TUV", "WXYZ", "_");
        Console.CLibWin = CLibWin;
    })(Console = ExprAE.Console || (ExprAE.Console = {}));
})(ExprAE || (ExprAE = {}));
//# sourceMappingURL=combined.js.map