
FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
    FilePondPluginFilePoster
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




FilePond.create( document.querySelector('input[type="file"]'),
	{
		files: [
			{  
        source: `https://ams-users.s3.us-west-1.amazonaws.com/assetType/${assetTypeImageName}`,
				options: {
					type: 'local'
				}
			}
		],
		server: {
			load: (source, load, error, progress, abort, headers) => {
				const myRequest = new Request(source);
				fetch(myRequest).then(function(response) {
					console.log(response)
					response.blob().then(function(myBlob) {
					        
						load(myBlob);
					});
				});
			}
		}
	}
)










// const inputElement = document.querySelector('input[type="file"]');
// // console.log();
// console.log('This is asset image name ', assetTypeImageName);
// if (assetTypeImageName){
//  var fileVar = `https://users.s3.us-west-1.amazonaws.com/assetType/${assetTypeImageName}`
// // var fileVar = `https://users.s3.us-west-1.amazonaws.com/assetType/Swallow.jpg`
//   var sourceVar =  `https://ams-users.s3.us-west-1.amazonaws.com/assetType/${assetTypeImageName}`
//   // var sourceVar =  `https://ams-users.s3.us-west-1.amazonaws.com/assetType/Swallow.jpg`
  
// }else{
//   // var sourceVar =  `https://ams-users.s3.us-west-1.amazonaws.com/assetType/Swallow.jpg`

// }
// FilePond.create(inputElement, {
//     allowMultiple: true,
//     files: [
//       {
//         source:sourceVar,
//         options: {
//           type: 'local'
//         }
//       }
//     ],
//     server: {
//       load: (fileVar, load) => {
//         console.log(inputElement.value)
//         console.log(inputElement.value)
//         // you would get the file data from your server here
//         fetch(fileVar)
//           .then(res => res.blob())
//           .then(load);
//       }
//     }
//   });

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
if (assetTypeImageName){
  console.log('This is assetTypeImageName from fileUpload', assetTypeImageName);

}



// FilePond.create(inputElement, {
//   allowMultiple: true,
//   files: [
//     {
//       source: 'wifi.jpg',
//       options: {
//         type: 'local'
//       }
//     }
//   ],
//   server: {
//     load: () => {
//       // you would get the file data from your server here
//       fetch('https://ams-users.s3.us-west-1.amazonaws.com/assetType/wifi.png')
//         .then(res => res.blob())
//         .then((dat)=>console.log(dat));
//     }
//   }
// });

// const inputElement = document.querySelector('input[type="file"]');
// let uniqueFileId = 'https://ams-users.s3.us-west-1.amazonaws.com/assetType/wifi.png'




// const pond = FilePond.create({
//     files: [
//         {
//             // the server file reference
//             source: 'https://ams-users.s3.us-west-1.amazonaws.com/assetType/wifi.png',

//             // set type to local to indicate an already uploaded file
//             options: {
//                 type: 'local',

//                 // optional stub file information
//                 file: {
//                     name: 'my-file.png',
//                     size: 3001025,
//                     type: 'image/png',
//                 },

//                 // pass poster property
//                 metadata: {
//                     poster: 'https://ams-users.s3.us-west-1.amazonaws.com/assetType/wifi.png',
//                 },
//             },
//         },
//     ],
// });

// const pond = FilePond.create(document.querySelector('file'));
// pond.server = {
//     url: 'https://ams-users.s3.us-west-1.amazonaws.com/assetType/swallow.png',
//     process: 'upload-file',
//     revert: null,
//     // this is the property you should set in order to render your file using Poster plugin
//     load: '/get-file/',
//     restore: null,
//     fetch: null
// };

// pond.files = [
//     {
//         // source: "123",
//         options: {
//             type: 'local',
//             metadata: {
//                 poster: 'https://ams-users.s3.us-west-1.amazonaws.com/assetType/wifi.png'
//             }
//         }
//     }
// ];

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

