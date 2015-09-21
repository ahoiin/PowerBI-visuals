/*
 *
 *  One Percent Circles Chart by Ahoiin
 *
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

/// <reference path="../_references.ts"/>

module powerbi.visuals {

    export interface OnePercentCirclesPoint {
        color: string;
        value: number;
        description: string;
    }

    export class OnePercentCircles implements IVisual {

        private static VisualClassName = 'onepercent_circles';
        private svg: D3.Selection;
        private number: D3.Selection;
        private description: D3.Selection;
        private mainGroupElement: D3.Selection;
        private dataView: DataView;

        //Capabilities - moved to onePercentCirclesByAhoiin.ts


        public static converter(dataView: DataView): OnePercentCirclesPoint[] {
            var colors = ["#00ACE4", "#00D8A5", "#9b59b6", "#F1B719", "#e74c3c" ];
            var random = Math.round(Math.random() * 4);
            var datapoints: OnePercentCirclesPoint[] = [];
            datapoints.push({
                color: colors[random],
                value: 0,
                description: ''
            });
            datapoints.push({color:'#e5e5e5',value:0,description: ''});

            if (dataView) {
                var table = dataView.table;
                for (var i = 0; i < table.rows[0].length; i++) {
                    if (!isNaN(table.rows[0][i])) {
                        datapoints[0].value = (table.rows[0][i] > 100) ? 100 : table.rows[0][i];
                        datapoints[1].value = (100 - table.rows[0][i] < 0) ? 0 : 100 - table.rows[0][i];
                    } else datapoints[0].description = table.rows[0][i];
                }

            }
            return datapoints;
        }

        public init(options: VisualInitOptions): void {
            var number = this.number = d3.select(options.element.get(0))
                .append("div")
                .classed(OnePercentCircles.VisualClassName + '_number', true);

            var description = this.description = d3.select(options.element.get(0))
                .append("div")
                .classed(OnePercentCircles.VisualClassName + '_description', true);

            var svg = this.svg = d3.select(options.element.get(0))
                .append('svg')
                .classed(OnePercentCircles.VisualClassName, true);
            this.mainGroupElement = svg.append('g');
        }


        public update(options: VisualUpdateOptions) {
            if (!options.dataViews && !options.dataViews[0]) return;
            var dataView = this.dataView = options.dataViews[0];
            var viewport = options.viewport;
            var dataPoints = OnePercentCircles.converter(dataView);
            var number = this.number;
            var number_val = dataPoints[0].value;
            var desc = this.description;
            var desc_val = dataPoints[0].description;
            var color_val = dataPoints[0].color;

            var outerWidth =  viewport.width;
            var outerHeight = viewport.height;
            var margin = { top: outerWidth*0.15, right:0, bottom: 0, left: 0  };
            var innerWidth =  outerWidth - margin.left - margin.right;
            var innerHeight = outerHeight - margin.top - margin.bottom;

            var elementsInRow = 13;
            var paddingEl =  (innerWidth-innerWidth*0.3) / elementsInRow || 30;
            var radius = ((innerWidth) / (elementsInRow + (elementsInRow*paddingEl)/7)) || 10;
            var row = 1;

            // update width/height
            this.svg.attr({
                'height': outerHeight,
                'width': outerWidth
            });
            var mainGroup = this.mainGroupElement;
            mainGroup.attr('transform', SVGUtil.translate((innerWidth/2 - ((radius+paddingEl)*elementsInRow)/2)+(radius+paddingEl), margin.top));

            var dataset = [];

              dataPoints.forEach(function(d, i) {
                while(d.value--) {
                  dataset.push({color:d.color});
                }
              });


            // update data
            var selection = mainGroup.selectAll("circle")
                .data(dataset);

            //enter
            selection.enter()
                .append("circle")
                    .attr("class", OnePercentCircles.VisualClassName + "_circle")
                    .style("fill", function(d,i) {
                        // change text
                        desc.text(desc_val);
                        // change also text color
                        number.text(number_val + '%').style('color',color_val);
                        return d.color;
                    })
                    .attr("r", 0)
                    .style("opacity", 0)
                    .attr("cx", function(d,i) { row = (i%elementsInRow == 0) ? i/elementsInRow : row; return ((i+1)-row*elementsInRow) * paddingEl;})
                    .attr("cy", function(d,i) { row = (i%elementsInRow == 0) ? i/elementsInRow : row; return row * paddingEl;})

            //update
            selection.transition()
                .duration(200)
                .delay(function(d,i) { return 6 * i; })
                .style("opacity", 1)
                .attr("r", function(d,i) {
                    // change text
                    desc.text(desc_val);
                    return radius;
                 });

            // remove
            selection.exit().remove();
        }

        public destroy(): void {
            this.svg = null;
        }
    }

}