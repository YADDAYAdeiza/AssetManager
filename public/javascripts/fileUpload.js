FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
)

FilePond.setOptions({
    stylePanelAspectRatio:100/120,
    imageResizeTargetWidth:120, 
    imageResizeTargetHeight:100
})
FilePond.parse(document.body)