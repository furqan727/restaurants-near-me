---
title: BiteFinder Guide
emoji: 🍛
colorFrom: orange
colorTo: yellow
sdk: docker
app_port: 7860
pinned: false
---

# BiteFinder Guide — Indian Restaurant Discovery & Order Hub

This is your full-stack React + Express + Vite + Gemini AI-powered discovery and live order manager application. It has been pre-configured to build, run, and scale beautifully on any modern hosting environment, specifically **Hugging Face Spaces (Docker Space)**.

---

## 🚀 How to Publish to Hugging Face Spaces (100% Free)

Follow these easy steps to host this app 24/7 without code modification or hosting fee:

> **Note (important):** Your project is configured to listen on **port 7860** for Hugging Face Spaces routing (Dockerfile + Space `app_port`).


### Step 1: Download your Project Files
*Export your project as a ZIP archive* from the **Settings / Workspace Menu** in Google AI Studio. Keep this ZIP file accessible on your computer.

### Step 2: Create a Hugging Face Space
1. Go to [Hugging Face Spaces](https://huggingface.co/spaces) and log in or register for a free account.
2. Click **"Create new Space"** (usually in the upper-right corner).
3. Fill out the configuration:
   - **Space Name**: Pick a name (e.g., `bitefinder-guide`).
   - **License**: Choose any license (e.g., `mit`).
   - **Select SDK**: Choose **Docker**.
   - **Docker template**: Select **Blank** (do not pick a pre-made template).
   - **Space Hardware**: Select the **Free - CPU Basic** tier (gives you 16GB RAM / 2 vCPUs completely for free).
   - **Visibility**: Toggle to **Public** so others can discover your page!
4. Click **"Create Space"**.

### Step 3: Upload files (Drag-and-Drop ZIP)
Hugging Face provides an easy web interface to add files directly:
1. Once your space is created, go to the **Files** tab (next to the "App" tab).
2. Click **"Add file"** ➔ **"Upload files"**.
3. Unzip your files, drag and drop the whole folder contents directly into the web uploader.
4. Add a commit message (e.g., `Initial commit containing Dockered BiteFinder app`) and click **"Commit changes to main"**.

*Alternatively: If you're comfortable with Git, you can clone the provided repo URL and push the files via command line.*

### Step 4: Configure the Gemini API Key (Secret Variable)
Since BiteFinder features an **Indian Food Discovery AI Assistant powered by Gemini**, you must supply your Gemini API key in Hugging Face Security Settings:
1. Inside your Space, click the **Settings** tab (gear icon at the top right).
2. Scroll down to the **Variables and Secrets** section.
3. Click **"New secret"** and input:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: *(Your real Google Gemini API Key from Google AI Studio)*
4. Click **"Save"**.

### Step 5: Build and Run!
1. Hugging Face Spaces will automatically detect the `Dockerfile` and start building the container.
2. The compilation progress can be tracked in the **Logs** viewer under the **App** tab.
3. Once completed (usually 1–2 minutes), your application will be live at:
   `https://huggingface.co/spaces/<your-username>/<your-space-name>`

---

## 🛠️ Port & Configuration Detail

- **Default Port**: The application dynamically listens on `process.env.PORT` which is standard on Hugging Face (defaults to `7860`), making it instantly compatible.
- **Data Persistence**: It maps user registers, account claims, and newly created restaurants directly within `/app/db.json` with write-level permission flags ready for Hugging Face non-root runtimes.
