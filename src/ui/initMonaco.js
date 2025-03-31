let editor;
let model;

export function initMonaco() {
  require.config({ paths: { vs: "../monaco-editor/min/vs" } });

  window.MonacoEnvironment = {
    getWorkerUrl: function () {
      const basePath = `${location.origin}/monaco-editor/min/`;
      const blobCode = `
        self.MonacoEnvironment = { baseUrl: '${basePath}' };
        importScripts('${basePath}vs/base/worker/workerMain.js');
      `;
      return URL.createObjectURL(new Blob([blobCode], { type: "application/javascript" }));
    }
  };

  require(["vs/editor/editor.main"], function () {
    let sessionId = null;
    const venvPath = ""; // Set your venv path here, e.g., "C:/Users/you/.virtualenvs/myenv"

    const debounce = (fn, delay) => {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    };

    const analyzeCode = async (code) => {
      if (!sessionId) return console.warn("sessionId is null");

      try {
        const res = await fetch(`http://localhost:3000/api/session/${sessionId}/diagnostics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, venvPath })
        });
        const { diagnostics } = await res.json();

        const markers = diagnostics.map((d) => ({
          message: d.message,
          startLineNumber: d.range.start.line + 1,
          endLineNumber: d.range.end.line + 1,
          startColumn: d.range.start.character + 1,
          endColumn: d.range.end.character + 1,
          severity: {
            1: monaco.MarkerSeverity.Error,
            2: monaco.MarkerSeverity.Warning,
            3: monaco.MarkerSeverity.Info,
            4: monaco.MarkerSeverity.Hint
          }[d.severity] ?? monaco.MarkerSeverity.Error
        }));

        monaco.editor.setModelMarkers(model, "pyright", markers);
      } catch (e) {
        console.warn("pyright diagnostics error:", e);
      }
    };

    const initEditor = async () => {
      const code = "";

      try {
        const res = await fetch("http://localhost:3000/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, venvPath })
        });

        ({ sessionId } = await res.json());
        console.log("sessionId created:", sessionId);
      } catch (e) {
        console.error("Session creation failed:", e);
        return;
      }

      model = monaco.editor.createModel(code, "python");

      editor = monaco.editor.create(document.getElementById("monacoEditorContainer"), {
        model,
        language: "python",
        theme: "vs-dark",
        stickyScroll: { enabled: true },
        smoothScrolling: true,
        automaticLayout: true,
        autoIndent: true,
        quickSuggestions: { other: true, comments: false, strings: false }
      });

      model.onDidChangeContent(
        debounce(() => analyzeCode(model.getValue()), 300)
      );

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        console.log("Saving code:", model.getValue());
      });

      monaco.languages.registerCompletionItemProvider("python", {
        triggerCharacters: [".", "(", "["],
        provideCompletionItems: async (model, position) => {
          try {
            const res = await fetch(`http://localhost:3000/api/session/${sessionId}/completion`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: model.getValue(),
                position: {
                  line: position.lineNumber - 1,
                  character: position.column - 1
                }
              })
            });

            const { completionList } = await res.json();

            return {
              suggestions: (completionList?.items || []).map((item) => ({
                label: item.label,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: item.insertText ?? item.label,
                detail: item.detail,
                documentation: item.documentation?.value ?? "",
                range: undefined
              }))
            };
          } catch (e) {
            console.warn("completion error:", e);
            return { suggestions: [] };
          }
        }
      });
    };

    initEditor();
  });
}
