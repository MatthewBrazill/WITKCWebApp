import { Editor } from 'https://cdn.jsdelivr.net/npm/@tiptap/core@2.0.0-beta.174/dist/tiptap-core.cjs.min.js'
import StarterKit from 'https://cdn.jsdelivr.net/npm/@tiptap/starter-kit@2.0.0-beta.183/dist/tiptap-starter-kit.cjs.min.js'
exports.announcement = () => {
    new Editor({
        element: document.getElementById('text_editor'),
        extensions: [StarterKit],
    })
}