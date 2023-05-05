import { execSync } from 'child_process';
import { Docker, Options } from 'docker-cli-js';
import { App, Modal, Notice, Plugin, PluginSettingTab, Setting, addIcon, requestUrl } from 'obsidian';
interface BrainSettings {
	openaiApiKey: string;
}

const DEFAULT_SETTINGS: BrainSettings = {
	openaiApiKey: ''
};

export default class Brain extends Plugin {
	settings: BrainSettings;
	loadingModal: Modal;

	async openBrain() {
		// Create a new Modal instance
		const modal = new Modal(this.app);

		// Set the title of the Modal
		modal.titleEl.setText('brAIn');

		// Create a loading modal
		this.loadingModal = new Modal(this.app);
		this.loadingModal.titleEl.setText('Loading...');
		this.loadingModal.contentEl.setText('Please wait while the docker is being loaded, the first time could take several minutes...');

		// Add a loading bar animation to the loading modal
		const progressEl = this.loadingModal.contentEl.createDiv('progress');
		progressEl.createDiv('bar');

		// Show the loading modal
		this.loadingModal.open();

		try {
			// Wait for the docker to be loaded
			await this.runBrainServer(this.settings.openaiApiKey);
		} catch (err) {
			// Remove the loading modal and show an error message if the docker container fails to start
			console.log('Failed to start brAIn: ' + err.message);
		}
		// Check if the brAIn web interface is available
		let isAvailable = false;
		let timeout = 10000; // 20-second timeout
		const interval = 2000; // Check every 2sec
		while (timeout > 0 && !isAvailable) {
			try {
				const response = await requestUrl({
					url: 'http://localhost:9000'
				});
				isAvailable = response.status == 200;
				if (!isAvailable) {
					await new Promise(resolve => setTimeout(resolve, interval));
				}
			} catch (err) {
				// Remove the loading modal and show an error message if the docker container fails to start
				console.log('Error connecting container: ' + err.message);
				await new Promise(resolve => setTimeout(resolve, interval));
			}
			timeout -= interval;
		}

		if (isAvailable) {
			// Remove the loading modal
			this.loadingModal.close();
			// Create a new iframe element
			// Set the source of the iframe to your brAIn view
			modal.contentEl.createEl('iframe', {
				attr: {
					type: 'text/html',
					src: 'http://localhost:9000',
					width: '550',
					height: '750',
					allowFullscreen: 'true'
				}
			});

			// Open the Modal
			modal.open();
		} else {
			// Show an error message if the brAIn web interface is not available
			new Notice('brAIn is not running, please check that the port 9000 is not being used by other service');
		}
		this.loadingModal.close();

	}

	async ingestDocs() {
		// Create a new Modal instance
		const modal = new Modal(this.app);

		// Set the title of the Modal
		modal.titleEl.setText('brAIn');

		// Create a loading modal
		this.loadingModal = new Modal(this.app);
		this.loadingModal.titleEl.setText('Ingesting docs...');
		this.loadingModal.contentEl.setText('Please wait while the docker is ingesting the docs of your vault, the fisrt time could take several minutes...');

		// Add a loading bar animation to the loading modal
		const progressEl = this.loadingModal.contentEl.createDiv('progress');
		progressEl.createDiv('bar');

		// Show the loading modal
		this.loadingModal.open();

		try {
			// Wait for the docker to be loaded
			await this.runIngestDocs(this.settings.openaiApiKey);
		} catch (err) {
			// Remove the loading modal and show an error message if the docker container fails to start
			console.log('Failed to ingest vault docs: ' + err.message);
		}
		this.loadingModal.close();
	}

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		addIcon("brAIn", `<svg version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"  xml:space="preserve"> <style type="text/css"> .st0{fill:#DDDDDD;} </style> <g> <path class="st0" d="M502.472,256.833c-6.491-61.075-40.69-110.46-86.082-144.101c-45.887-34.04-103.296-52.724-157.675-52.76 c-56.443,0.009-91.262,7.173-114.312,17.082c-22.776,9.644-33.774,22.98-39.813,30.843c-24.68,4.029-49.262,18.348-68.77,38.697 C15.107,168.343,0.054,197.423,0,229.381c0,34.97,8.112,64.52,24.299,86.498c14.354,19.596,35.288,32.472,60.207,37.148 c1.638,9.456,5.56,20.003,13.672,29.647c8.412,10.06,19.888,17.383,33.454,22.032c13.584,4.675,29.329,6.836,47.234,6.853h75.084 c1.85,4.729,4.108,9.236,7.217,13.213c7.642,9.785,18.649,16.656,31.834,20.96c13.248,4.33,28.859,6.288,46.995,6.296 c8.909,0,17.348-0.407,24.512-0.752h0.026c5.136-0.274,9.555-0.469,12.698-0.469c9.466,0,18.526-2.302,26.318-6.819 c7.793-4.498,14.257-11.166,18.676-19.357c2.232-4.154,3.702-8.51,4.8-12.902c16.727-3.126,30.604-9.236,41.407-17.028 c12.663-9.121,21.367-20.11,27.283-30.09c11.556-19.552,16.267-41.247,16.285-61.384 C511.982,286.064,508.511,270.08,502.472,256.833z M475.862,352.849c-4.649,7.837-11.352,16.241-20.916,23.121 c-9.581,6.872-22.041,12.38-39.06,14.319l-9.519,1.072l-0.7,9.555c-0.292,4.127-1.576,8.767-3.737,12.76 c-2.506,4.578-5.835,7.962-9.918,10.335c-4.1,2.356-9.006,3.71-14.78,3.718c-4.073,0-8.714,0.24-13.858,0.496l1.922-0.088 l-1.914,0.088c-7.145,0.355-15.178,0.736-23.386,0.736c-21.943,0.035-38.299-3.356-48.747-8.864 c-5.251-2.736-9.06-5.906-11.884-9.511c-2.807-3.622-4.711-7.74-5.782-12.884l-1.904-9.218h-92.812 c-16.01,0-29.302-1.992-39.725-5.578c-10.44-3.622-17.94-8.678-23.28-15.054c-6.96-8.306-9.024-17.32-9.289-25.237l-0.31-10.077 l-10.024-1.044C72.72,328.914,55.354,318.97,42.86,302.18c-12.424-16.815-19.791-41.3-19.791-72.798 c-0.054-24.422,11.874-48.474,29.443-66.875c17.463-18.454,40.46-30.674,59.419-32.463l4.348-0.452l2.966-3.206 c1.328-1.452,2.382-2.851,3.294-4.002c5.986-7.474,12.114-15.806,31.002-24.139c18.845-8.156,50.652-15.222,105.174-15.213 c49.076-0.036,102.278,17.232,143.932,48.217c41.726,31.046,71.78,75.153,77.094,129.578l0.203,2.098l0.922,1.887 c4.844,9.776,8.094,23.608,8.066,38.414C488.932,319.776,484.992,337.451,475.862,352.849z"/> <path class="st0" d="M357.042,146.417h24.059c5.172,0,9.378-4.242,9.378-9.573c0-5.215-4.206-9.43-9.378-9.43h-24.059 c-5.331,0-9.555,4.216-9.555,9.43C347.488,142.175,351.711,146.417,357.042,146.417z"/> <path class="st0" d="M244.21,237.307c0,5.287,4.25,9.564,9.501,9.564c5.162,0,9.475-4.276,9.475-9.564v-51.82 c0-2.399,0.709-2.958,0.886-3.179c3.02-2.966,14.274-2.966,22.164-2.966l0.301,0.106h62.226c1.204,0,2.48-0.106,3.906-0.106 c5.012-0.221,11.202-0.434,13.796,2.072c1.647,1.611,2.604,5.19,2.604,9.988v31.809v1.416c-0.204,6.544-0.24,17.56,7.128,25.042 c2.869,2.958,8.2,6.464,16.896,6.464h48.89c5.136,0,9.352-4.233,9.352-9.555c0-5.198-4.216-9.519-9.352-9.519h-48.89l-3.418-0.806 c-1.736-1.797-1.621-8.332-1.621-11.467v-33.385c0-10.307-2.886-18.277-8.394-23.599c-8.484-8.138-20.022-7.801-27.629-7.483 c-1.258,0-2.302,0.045-3.268,0.045h-31.364c0.372-2.622,0.372-5.26,0.274-7.633v-27.602c0-5.189-4.268-9.476-9.448-9.476 c-5.286,0-9.43,4.286-9.43,9.476v27.752c0,2.222,0,5.738-0.47,6.65c0,0-1.301,0.832-6.314,0.832c-1.442,0-2.992,0-4.684,0 c-12.92-0.16-27.778-0.204-36.615,8.474c-2.887,2.922-6.5,8.208-6.5,16.648V237.307z"/> <path class="st0" d="M213.677,159.709c5.304,0,9.555-4.348,9.555-9.528v-13.594h15.93c5.154,0,9.413-4.268,9.413-9.554 c0-5.162-4.259-9.493-9.413-9.493h-15.93v-10.467c0-5.233-4.251-9.528-9.555-9.528c-5.154,0-9.413,4.294-9.413,9.528v43.108 C204.264,155.361,208.523,159.709,213.677,159.709z"/> <path class="st0" d="M110.841,173.682h39.468c6.438-0.229,12.565-0.229,15.452,2.807c2.559,2.498,3.967,8.111,3.967,16.17v37.051 c0,5.242,4.233,9.546,9.581,9.546c5.154,0,9.458-4.303,9.458-9.546v-7.882h14.886c5.251,0,9.44-4.277,9.44-9.51 c0-5.251-4.188-9.599-9.44-9.599h-14.886v-10.06c0-13.672-3.135-23.351-9.626-29.736c-8.421-8.448-19.8-8.368-28.877-8.288h-39.423 c-5.384,0-9.511,4.312-9.511,9.475C101.33,169.387,105.457,173.682,110.841,173.682z"/> <path class="st0" d="M135.892,229.099c0-5.251-4.365-9.555-9.483-9.555H59.791c-5.26,0-9.555,4.304-9.555,9.555 c0,5.233,4.295,9.528,9.555,9.528h24.148v17.339c0,5.286,4.188,9.519,9.386,9.519c5.402,0,9.59-4.233,9.59-9.519v-17.339h23.494 C131.527,238.627,135.892,234.331,135.892,229.099z"/> <path class="st0" d="M194.576,291.412c1.665,0,3.242,0,4.649,0h76.704c17.498,0,30.772-4.64,39.6-13.884 c13.566-14.363,12.619-35.634,11.919-49.687c-0.124-2.683-0.248-5.206-0.248-7.323c0-5.296-4.25-9.51-9.608-9.51 c-5.18,0-9.368,4.215-9.368,9.51c0,2.408,0.124,5.171,0.248,8.111c0.584,12.256,1.24,27.337-6.854,35.873 c-4.941,5.26-13.682,7.89-25.689,7.89h-76.704c-1.337,0-2.7,0-4.348,0c-15.133-0.23-40.584-0.638-56.753,15.319 c-9.068,8.944-13.681,21.545-13.681,37.396c0,5.153,4.17,9.52,9.484,9.52c5.18,0,9.51-4.366,9.51-9.52 c0-10.768,2.594-18.579,8.049-23.918C161.935,290.934,181.612,291.235,194.576,291.412z"/> <path class="st0" d="M323.96,332.616c0-5.162-4.171-9.502-9.475-9.502H194.107c-5.19,0-9.538,4.34-9.538,9.502 c0,5.268,4.348,9.519,9.538,9.519h36.81v18.985c0,5.323,4.225,9.502,9.458,9.502c5.251,0,9.493-4.179,9.493-9.502v-18.985h64.617 C319.788,342.135,323.96,337.884,323.96,332.616z"/> <path class="st0" d="M377.887,370.065h-4.471v-17.693c0-5.384-4.18-9.528-9.475-9.528c-5.26,0-9.502,4.145-9.502,9.528v17.693 h-32.941c-5.242,0-9.502,4.241-9.502,9.528c0,5.224,4.26,9.448,9.502,9.448h56.39c5.208,0,9.484-4.224,9.484-9.448 C387.371,374.305,383.095,370.065,377.887,370.065z"/> <path class="st0" d="M421.579,323.114v-15.523h3.419c5.357,0,9.599-4.17,9.599-9.43c0-5.251-4.242-9.555-9.599-9.555h-66.459 c-5.225,0-9.511,4.304-9.511,9.555c0,5.26,4.286,9.43,9.511,9.43h43.983v15.523c0,5.358,4.313,9.502,9.556,9.502 C417.311,332.616,421.579,328.472,421.579,323.114z"/> <path class="st0" d="M451.333,347.909h-24.042c-5.304,0-9.546,4.18-9.546,9.467c0,5.286,4.241,9.43,9.546,9.43h24.042 c5.33,0,9.616-4.144,9.616-9.43C460.95,352.089,456.663,347.909,451.333,347.909z"/> </g> </svg>`);

		const ribbonIconEl = this.addRibbonIcon('brAIn', 'brAIn', async (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			try {
				this.openBrain();
			} catch (err) {
				new Notice('Failed to open brAIn: ' + err.message);
			}
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		this.addCommand({
			id: 'open-brain',
			name: 'Open chat',
			callback: () => this.openBrain()
		});

		this.addCommand({
			id: 'ingest-docs',
			name: 'Ingest vault docs',
			callback: () => this.ingestDocs()
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new BrainSettingTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

		try {
			// Check if Docker is installed by running "docker --version" command
			execSync('docker --version');
		} catch (error) {
			// Docker is not installed, show a dialog
			console.error('Docker is not installed in the system.');
			// You can use a dialog library or show an alert using the browser's window object
			new Notice('Docker is not installed in the system, brAIn plugin need docker to run.');
		}
		if (!this.settings.openaiApiKey) {
			// this.settings.openaiApiKey is empty or undefined
			new Notice('OpenAI api key not set. You need to add an OpenAI api key brAIn settings.');
		}
	}

	onunload() { }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}


	async runBrainServer(openaiApiKey: string) {
		// Use Docker-CLI-JS to build the Dockerfile
		const options = new Options(
		/* machineName */ undefined,
		/* currentWorkingDirectory */ undefined,
		/* echo*/ true,

		);

		const docker = new Docker(options);
		const vaultPath = (this.app.vault.adapter as any).basePath

		// Use Docker-CLI-JS to run the container
		try {
			await docker.command(`rm brain || true`)
			await docker.command(`run -d --name brain -p 9000:9000 -v ${vaultPath}:${vaultPath} -e MARKDOWN_FILES=${vaultPath} -e OPENAI_API_KEY=${openaiApiKey} -t lusob04/brain`);
		} catch (err) {
			console.log('Failed to start brAIn: ' + err.message);
		}
	}

	async runIngestDocs(openaiApiKey: string) {
		// Use Docker-CLI-JS to build the Dockerfile
		const options = new Options(
		/* machineName */ undefined,
		/* currentWorkingDirectory */ undefined,
		/* echo*/ true,
		);

		const docker = new Docker(options);
		const vaultPath = (this.app.vault.adapter as any).basePath

		// Use Docker-CLI-JS to run the container
		try {
			await docker.command(`stop brain || true`)
			await docker.command(`rm brain || true`)
			await docker.command(`run --rm --name brain -v ${vaultPath}:${vaultPath} -e MARKDOWN_FILES=${vaultPath} -e OPENAI_API_KEY=${openaiApiKey} -t lusob04/brain make ingest`);
		} catch (err) {
			console.log('Failed ingesting: ' + err.message);
		}
	}
}

class BrainSettingTab extends PluginSettingTab {
	plugin: Brain;

	constructor(app: App, plugin: Brain) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'brAIn Settings.' });

		new Setting(containerEl)
			.setName('OpenAI api key')
			.setDesc('Set here your own OpenAI api key')
			.addText((text) =>
				text
					.setPlaceholder('')
					.setValue(this.plugin.settings.openaiApiKey)
					.onChange(async (value) => {
						this.plugin.settings.openaiApiKey = value;
						await this.plugin.saveSettings();
					}));
	}
}
