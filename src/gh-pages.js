chrome.extension.sendMessage({}, function() {
	var branches = document.querySelectorAll("div[data-tab-filter='branches'] a");
	var ghPagePresent = false;

	for (var i = 0; i < branches.length; ++i) {
		var branch = branches[i];
		if(branch.dataset.name == 'gh-pages') {
			ghPagePresent = true;
			break;
		}
	}

	if(ghPagePresent === true) {
		var repositoryName = document.title.split(' ', 1)[0].split('/', 2);

		var pageHeadActions = document.querySelector('ul.pagehead-actions');
		var pageButtonList = document.createElement('li');

		var pageButtonButton = document.createElement('a');
		pageButtonButton.className = 'btn btn-sm sidebar-button';
		pageButtonButton.title = 'Visit the repository Github-Page';
		pageButtonButton.innerHTML = '<span class="octicon octicon-browser"></span> Visit the GitHub-Page';
		pageButtonButton.target = '_blank';
		pageButtonButton.href = 'https://' + repositoryName[0] + '.github.io/' + repositoryName[1];

		pageButtonList.appendChild(pageButtonButton);
		pageHeadActions.insertBefore(pageButtonList, pageHeadActions.firstChild);
	}
});