
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

// set up s3 connection
var s3 = new AWS.S3({
    accessKeyId: 'AKIAVNHKTJGJGLZBIHOB',
    secretAccessKey: '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',
    region: 'us-west-1'
});

// set custom FilePond file processing method
FilePond.setOptions({
    server: {
        process: function(fieldName, file, metadata, load, error, progress, abort) {
            console.log('This is fieldName', fieldName);
            var fol;
            switch (fieldName){
                case 'photo':
                    fol = '/users';
                    break;
                case 'assetTypePic':
                    fol='/assetType';
                    break;
            }
            s3.upload({
                Bucket: 'ams-users'+fol,
                Key: file.name,
                Body: file,
                ContentType: file.type
                // ACL: 'public-read'
            }, function(err, data) {

                if (err) {
                    error('Something went wrong');
                    return;
                }

                // pass file unique id back to filepond
                load(data.Key.slice(data.Key.indexOf('/')+1)); //If we hadn't appended fol as subdirectory, we would simply have used data.Key

            });

        }
    }
});

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

