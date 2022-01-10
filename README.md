<h1>Steps to Get Coding!</h1>
<ol>
<li>Download <a href="https://nodejs.org/en/">NodeJS</a>. (You can check it worked by opening a command line and running <code>node -v</code>. If it gives you something not angry and jarbled, you're good).</li>
<li>Download this folder using Git (download Git <a href="https://git-scm.com/downloads">here</a>) and opening up a command line (Windows key => Terminal) and typing: <code>git clone https://github.com/html1101/Gun-Detection-GUI</code> (it'll ask you to login to your GitHub account).</li>
<li>Get into this repository in that command line with <code>cd Gun-Detection-GUI</code> and open it in VSCode with <code>code .</code> (keep the period)</li>
<li>Now you'll have the folder open in VSCode; you can use that for editing the files in the folder Frontend just like QuizRead.</li>
<li>You can run all this by going back to that command line you opened VSCode from and entering: <code>npm install</code> (for the first time you run this, you don't need to use it afterwards), then <code>npm start</code></li>
<li>Every time you change a file in Frontend, you don't need to <code>npm start</code> every single time; rather, if you simply refresh the page with Ctrl-R, the UI should update.</li>
<li>Once you're ready to save your work (better too much than too little; I've already committed my barebones backend stuff 3 times &#9786;), you can push this back to GitHub by running: <code>git add</code>, then <code>git commit -am "[Your message]"</code>, and <code>git push -u origin main</code>.</li>
</ol>

<h1>Steps to Get Done!</h1>
- [x] Create framework to add cameras (see <code>cameras.js</code>)
- [ ] Search and add cameras and popup.
- [ ] Classification models
- [ ] Object Detection models
- [ ] Users page
- [ ] Actual model - highlighting, notifications
- [ ] Display camera feed in dashboard

<h1>Current Limitations</h1>
- onvif uses xml2js - very difficult to setup w/ Electron when packaging
- Unable to detect camera on complex networks, uses multicasting which has some limitations