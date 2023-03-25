// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const fs = require("fs");
const vscode = require("vscode");
const { default: axios } = require("axios");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "startgpt" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand("startgpt.start", async () => {
		// The code you place here will be executed every time your command is executed

		const gpt_use_case = await vscode.window.showQuickPick(
			["test", "code analysis", "code optimize suggestion"],
			{ placeHolder: "Select the view to show when opening a window." }
		);

		if (gpt_use_case == "test") {
			const test_case_provider = await vscode.window.showQuickPick(
				["jest", "enzyme", "chai", "react-testing-library"],
				{ placeHolder: "Select the view to show when opening a window." }
			);

			// Display a message box to the user
			vscode.window.showInformationMessage("Generating Test Cases...");

			let currentFile = "";
			if (vscode.workspace.workspaceFolders.length) {
				currentFile = vscode.window.activeTextEditor.document.fileName;
			}

			if (currentFile != "") {
				fs.readFile(currentFile, async (err, data) => {
					const content = data.toString();
					let search = "";
					let testFile = "";

					if (currentFile.includes(".js")) {
						search = `Write Code of unit test case using ${test_case_provider} for following: \n`;
						testFile = currentFile.replace(".js", ".test.js");
					} else if (currentFile.includes(".ts")) {
						search = `Write Code of unit test case using ${test_case_provider} for following: \n`;
						testFile = currentFile.replace(".ts", ".spec.ts");
					}

					if (search !== "") {
						const response = await createComplettion(search + content);
						const code = response.choices[0].message.content;

						fs.writeFile(testFile, code, (err) => {
							if (err) {
								console.log(err);
								vscode.window.showInformationMessage("Test Cases Generation Failed");
							}
							else {
								vscode.window.showInformationMessage("Test Cases Generated");
							}
						});
					}
				});

			}
		} else {
			vscode.window.showInformationMessage("Generating Report...");

			let currentFile = "";
			if (vscode.workspace.workspaceFolders.length) {
				currentFile = vscode.window.activeTextEditor.document.fileName;
			}

			if (currentFile != "") {
				fs.readFile(currentFile, async (err, data) => {
					const content = data.toString();
					let search = "";
					let testFile = "";
					search = `${gpt_use_case} for the following code and generate report \n`;
					testFile = currentFile + ".report.txt";
					const response = await createComplettion(search + content);
					const code = response.choices[0].message.content;
					fs.writeFile(testFile, code, (err) => {
						if (err) {
							console.log(err);
							vscode.window.showInformationMessage("Report Generation Failed");
						}
						else {
							vscode.window.showInformationMessage("Report Generated");
						}
					});
				});
			}
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate,
};

async function createComplettion(prompt) {
	const { data } = await axios.post('https://api.openai.com/v1/chat/completions', {"model": "gpt-3.5-turbo","messages": [{"role": "user", "content": prompt}],"temperature": 0.2}, {
		headers: {
		  'Content-Type': 'application/json',
		  'Authorization': 'Bearer EnterHere'
		}
	})

	return data;
}