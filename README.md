# CodeBlock
🧠 Moveo-CodeBlock
An online collaborative JavaScript coding platform that allows a mentor and multiple students to work on code blocks in real-time.

🚀 Features
👨‍🏫 The first user in a code block becomes the mentor

🧑‍🎓 All other users become students

🧑‍💻 Live collaborative code editor

⏱️ Real-time synchronization via Socket.IO

🧠 Code syntax highlighting using Monaco Editor

🧮 Student counter per room

😄 Display a smiley when a student writes the correct solution

🧹 When the mentor leaves – all students are redirected to the lobby

⭐ Each code block has a difficulty level (1–5 stars)

📘 Mentor-only button: Reveal the solution and explanation to all students

🗂️ Pages :

Lobby Page:
List of at least 4 code blocks. Clicking a block redirects to the editor.

Code Block Page:
Contains title, code editor, role indicator, and real-time updates.

🧱 Tech Stack:

Frontend: React + TypeScript + Socket.IO + Monaco Editor

Backend: Node.js + Express + TypeScript + Socket.IO

Database: MongoDB (Mongoose)

🧪 How to Run Locally
1. Clone the repository
git clone https://github.com/RoniTwito08/Moveo-CodeBlock.git
cd Moveo-CodeBlock
2. Setup server :
cd server ->
npm install ->
npm run dev .
3. Setup client :
cd client ->
npm install ->
npm run dev .
