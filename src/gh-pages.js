var ghPages = {
	repositoryMetaName: null,
	repositoryBranches: null,
	getRepositoryMetaName: function () {
		if (!this.repositoryMetaName) {
			var titleNameSplit = document.title.split(' ');
			this.repositoryMetaName = titleNameSplit[0].split('/', 2);
		}
		return this.repositoryMetaName;
	},
	getRepositoryFullName: function () {
		return this.getRepositoryUsername() + '/' + this.getRepositoryName();
	},
	getRepositoryName: function () {
		return this.getRepositoryMetaName()[1];
	},
	getRepositoryUsername: function () {
		return this.getRepositoryMetaName()[0];
	},
	getRepositoryBranches: function () {
		if (!this.repositoryBranches) {
			var currentBranches = [];
			var branches = document.querySelectorAll("div[data-tab-filter='branches'] a");

			for (var i = 0; i < branches.length; ++i) {
				currentBranches.push(branches[i].dataset.name);
			}

			this.repositoryBranches = currentBranches;
		}

		return this.repositoryBranches;
	},
	getGithubPagesType: function () {
		var hasPagesBranch = this.getRepositoryBranches().indexOf('gh-pages') !== -1;
		var hasPagesRepoName = this.getRepositoryName().match(/\.github\.(io|com)$/);

		if (hasPagesBranch) {
			return 1;
		} else if (hasPagesRepoName) {
			return 2;
		}

		return false;
	},
	hasGithubPages: function () {
		return this.getGithubPagesType() !== false;
	},
	isValidRepository: function () {
		// check if repository and not a fork
		return (document.querySelector('body:not(.fork) div.main-content div.repohead') && ghPages.hasGithubPages()) || false;
	},
	injectButton: function() {
		// check if cache data is present
		var cacheData = this.getData(this.getRepositoryFullName());

		if (!cacheData || !cacheData.cname) {
			var githubPagesType = this.getGithubPagesType();

			var targetRepositoryBranch = githubPagesType === 2 ? 'master' : 'gh-pages';

			// https://api.github.com/repos/StevenVanAcker/OverTheWire-website/contents/CNAME
			// https://cdn.rawgit.com/
			//var cnameRepositoryUrl = 'https://raw.githubusercontent.com/' + this.getRepositoryFullName() + '/' + targetRepositoryBranch + '/CNAME';
			var cnameRepositoryUrl = 'https://cdn.rawgit.com/' + this.getRepositoryFullName() + '/' + targetRepositoryBranch + '/CNAME';
			//var cnameRepositoryUrl = 'https://api.github.com/repos/' + this.getRepositoryFullName() + '/contents/' + targetRepositoryBranch + '/CNAME';

			var xhr = new XMLHttpRequest();
			xhr.open("GET", cnameRepositoryUrl, true);
			xhr.onload = function (e) {
				if (xhr.readyState === 4) {
					var cnameData = null;

					if (xhr.status === 200) {
						cnameData = xhr.responseText.replace(/(\r\n|\n|\r)/gm, '');
					}

					this.setData(this.getRepositoryFullName(), {cname: cnameData});
					this.onReceiveCustomCNAME(cnameData);
				}
			}.bind(this);
			xhr.send();

			return null;
		}

		// cache present
		this.onReceiveCustomCNAME(cacheData.cname);
	},
	getData: function (key) {
		var data = localStorage.getItem(key);
		return JSON.parse(data);
	},
	setData: function (key, object) {
		localStorage.setItem(key, JSON.stringify(object));
	},
	onReceiveCustomCNAME: function(cname)
	{
		var pageHeadActions = document.querySelector('ul.pagehead-actions');
		var pageButtonList = document.createElement('li');

		var pageButtonButton = document.createElement('a');
		pageButtonButton.className = 'btn btn-sm sidebar-button';
		pageButtonButton.title = 'Visit the repository Github-Page';
		pageButtonButton.innerHTML = '<span class="octicon octicon-browser"></span> Visit the GitHub-Page';
		pageButtonButton.target = '_blank';

		pageButtonButton.href = 'https://' + this.getRepositoryUsername() + '.github.io/' + this.getRepositoryName();
		if (cname) {
			pageButtonButton.href = 'http://' + cname;
		}

		pageButtonList.appendChild(pageButtonButton);
		pageHeadActions.insertBefore(pageButtonList, pageHeadActions.firstChild);
	}
};

chrome.extension.sendMessage({}, function() {
	if(ghPages.isValidRepository()) {
		ghPages.injectButton();
	}
});
