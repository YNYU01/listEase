const modelFlow = document.getElementById('model-flow');
const modelList = document.getElementById('model-list');
const modelMain = document.getElementById('model-main');
const modelTable = document.getElementById('model-table');

function addZYtable(){
    var zys = userImgData.zy;
    zys.forEach((item,index) => {
        if(index == 1){
            var node = document.createElement("div")
            node.id = 'zy_' 
        } else {

        }
    })
}

//导出
async function exportAll(){

    var zyNode = document.getElementById("zy_w_h")
    imgViewBox.style.transform = 'scale(1.04)';
    var svgElem = [...zyNode.querySelectorAll('image'),...zyNode.querySelectorAll('img')];
    console.log(svgElem)
    if(svgElem && svgElem.length > 0){
        svgElem.forEach(function(node,index) {
            var href = node.getAttributeNS("http://www.w3.org/1999/xlink", "xlink:href");
            if(!href){
                href = node.getAttribute('xlink:href');
                if(!href){
                    href = node.src
                    console.log(href)
                }
            }
            if (href.split('/').length > 1){
                console.log('链接',node.id)
                // 使用fetch获取图片
                fetch(href)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.blob();
                })
                .then(blob => {
                    var reader = new FileReader();
                    reader.onloadend = async function() {
                        var dataURL = reader.result;
                        await node.setAttribute("href", dataURL);
                        await node.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataURL );
                        if(index == svgElem.length - 1){
                            exportOneAs(imgViewBox,'png','test')
                        }
                    };
                    reader.readAsDataURL(blob);
                })
                .catch(error => console.error('Error loading image:', error));
            }else{
                if(index == svgElem.length - 1){
                    exportOneAs(imgViewBox,'png','test')
                }
            }
            
            
        });
    }else{
        exportOneAs(imgViewBox,'png','test')
    }

}

function exportOneAs(node,type,name){
    if(type == 'jpeg'){
        setTimeout(()=>{
            domtoimage.toJpeg(node, { quality: 1 })/* toJpeg(node,{quality:number}) | toPng(node) | toPixelData(node).then(function(pixels){} */
            .then(function (dataUrl) {
                var link = document.createElement('a');
                link.download = name + '.jpg';
                link.href = dataUrl;
                link.click();
            });
            node.style.transform = 'scale('+ zoom/100 +')';
        },500)
    }
    if(type == 'png'){
        setTimeout(()=>{
            domtoimage.toPng(node)/* toJpeg(node,{quality:number}) | toPng(node) | toPixelData(node).then(function(pixels){} */
            .then(function (dataUrl) {
                var link = document.createElement('a');
                link.download = name + '.png';
                link.href = dataUrl;
                link.click();
            });
            node.style.transform = 'scale('+ zoom/100 +')';
        },500)
    }
}

/*---------------自定义节点----------------------*/

//有限字数文案节点
function limitedString() {
    this.addOutput("string", "string");
    this.addProperty("value", "",);//name, default_value,type,extra_info
    this.widget = this.addWidget("text","Text","","value");  //link to property value
    this.widgets_up = true;
    this.size = [180, 30];
}

limitedString.title = "文案";
limitedString.desc = "输入带限定字数的文案";

limitedString.prototype.setValue = function(v){this.setProperty("value",v)}

limitedString.prototype.onExecute = function() {
    this.setOutputData(0, this.properties["value"]);     
};

LiteGraph.registerNodeType("imginfo/string", limitedString);


//基础信息节点
function ImgInfoMain() {
    this.addInput("主标题", "string"); // 主标题输入端口
    this.addInput("副标题", "string"); // 副标题输入端口
    this.addOutput("输出","string")
    this.size = [180, 100];
}

ImgInfoMain.title = "配置项（基础）";
ImgInfoMain.desc = "接收主标题和副标题信息";

ImgInfoMain.prototype.onExecute = function () {
    var mainTitle = this.getInputData(0); // 主标题
    var subTitle = this.getInputData(1); // 副标题
    this.setOutputData(0,"[" + mainTitle + "," + subTitle + "]") 
};

ImgInfoMain.prototype.setValue = function(v){this.setProperty("value",v)}


LiteGraph.registerNodeType("imginfo/main", ImgInfoMain);

 

/*---------------从数据生成节点----------------------*/

function addFlowEditor(userImgData){
    
    var graph = new LGraph();   
    var canvas = new LGraphCanvas("#model-flow", graph);
    canvas.show_info = false;
    graph.start()

    //示例数据
    var node_input1 = LiteGraph.createNode("imginfo/string","文案");
    node_input1.pos = [200,200];
    node_input1.setValue("示例文案") 
    graph.add(node_input1);


    var node_input3 = LiteGraph.createNode("imginfo/main");
    node_input3.pos = [500,200];
    graph.add(node_input3);

    var node_input2 = LiteGraph.createNode("imginfo/string");
    node_input2.pos = [200,300];
    node_input2.setValue("示例文案") 
    graph.add(node_input2);

    node_input1.connect(0, node_input3, 0 );
    node_input2.connect(0, node_input3, 1 );

}