function addGauge(widget, widgetOptions) {
    
    var gauge = c3.generate({
        bindto : $("#" + widget.widgetID + " .panel-body")[0],
        data: {
            columns: [
                ['data', 62]
            ],
            type: 'gauge',
            
        },
        onmouseover: function() {},
        onmouseout: function() {},
        
        gauge: {
            label: {
                format: function(value, ratio) {
                    return value;
                },
                show: true
            },
            min: parseInt(widgetOptions.min), 
            max: parseInt(widgetOptions.max),
            units: widgetOptions.units,
            width: 40,
            expand: false
        },
        color: {
            pattern: ['#77CB77', '#73C9E2', '#FAA022', '#EC4E4A'], 
            threshold: {
                values: [30, 60, 90, 100]
            }
        },
        size: {
            height : 200
        },
        tooltip: {
            show: false
        }
    });
    $(".c3-chart-arcs-gauge-min").css("font-size", "10");
    $(".c3-chart-arcs-gauge-max").css("font-size", "10");
    $(".c3-chart-arcs-gauge-unit").css("font-size", "10");
    
    return gauge;
   
}

function GaugeWidget(widgetID) {
    
    $.extend(GaugeWidget.prototype, EventEmitter.prototype);
    
    this.widgetID = widgetID;
    this.widgetObj = undefined;
    this.panel = undefined;
    
    this.options = {min: "0", max: "100", units: " %"}
    this.gauge= undefined;
    
    this.create = function (panel, widgetOptions) {
        
        this.panel = panel;
        
        this.widgetObj = $(document.createElement("div"));
        this.widgetObj.addClass("panel panel-primary gauge");
        this.widgetObj.attr("id", this.widgetID);
        this.widgetObj.css("width", "290px").css("height", "290px").css("margin", "5px")
        
        addWidgetToolbar(this.widgetObj);
        setWidgetListeners(this);
        
        this.widgetObj.append($(document.createElement("div")).addClass("panel-body"));
        this.panel.panelObj.find(".widget-container").append(this.widgetObj);
        
        this.config(widgetOptions);
        
        
        
        return this;
        
    }
    
    this.read = function () {
        
    }
    
    this.write = function (data) {
        
        this.gauge.load({
            columns: [['data', data.value]]
        });
    }
    
    this.config = function (widgetOptions) {
        
        setWidgetOptions(this, widgetOptions);
        
        console.log(this.options);
        
        if(this.gauge != undefined)
            this.gauge = this.gauge.destroy();
        
        this.gauge = addGauge(this, this.options);
        
    }
    
}

widgets["Gauge"] = {};
widgets["Gauge"].class = GaugeWidget;
widgets["Gauge"].options = ["min", "max", "units"];