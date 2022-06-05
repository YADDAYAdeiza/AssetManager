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

//Consider using code below

// const rootStyles = window.getComputedStyle(document.documentElement)

// if (rootStyles.getPropertyValue('--asset-pic-width-large') != null && rootStyles.getPropertyValue('--asset-pic-width-large') !=""){
//     ready();
// }else{
//     document.getElementById('multistep-css').addEventListener('load', ready);
// }

// ready();

// function ready(){
//     const picWidth = parseFloat(rootStyles.getPropertyValue('--asset-pic-width-large'));
//     const picAspectRatio = parseFloat(rootStyles.getPropertyValue('--asset-pic-aspect-ratio'));
//     const picHeight = picWidth/picAspectRatio
    
    
//     FilePond.registerPlugin(
//         FilePondPluginImagePreview,
//         FilePondPluginImageResize,
//         FilePondPluginFileEncode,
//     )
// //use this. Try.
//     // FilePond.setOptions({
//     //     stylePanelAspectRatio:1/picAspectRatio,
//     //     imageResizeTargetWidth:picWidth, 
//     //     imageResizeTargetHeight:picHeight
//     // })
    
//     FilePond.setOptions({
//         stylePanelAspectRatio:100/120,
//         imageResizeTargetWidth:120, 
//         imageResizeTargetHeight:100
//     })
//     FilePond.parse(document.body)
// }

