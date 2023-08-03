const ImageTool = window.ImageTool;

const editor = new EditorJS({
    holder: 'editorjs', 
  
    tools: { 
        header: {
            class: Header, 
            inlineToolbar: ['link'] 
        }, 
        list: { 
            class: List, 
            inlineToolbar: true 
        },
        linkTool: LinkTool,
        raw: RawTool,
        //image: SimpleImage,
        image: {
            class: ImageTool,
            config: {
              endpoints: {
                byFile: 'http://localhost:3000/fileupload/img', // Your backend file uploader endpoint
                byUrl: 'http://localhost:3000/fetchUrl', // Your endpoint that provides uploading by Url
              }
            }
          },
        quote: Quote,
        embed: Embed,
    }, 
})