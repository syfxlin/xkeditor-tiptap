export const errSvg = `
<svg class="mermaid-err" width="400" xmlns="http://www.w3.org/2000/svg" height="100" viewBox="768 0 512 512"><style>
.mermaid-err .label {
font-family: 'trebuchet ms', verdana, arial;
font-family: var(--mermaid-font-family);
fill: #333;
color: #333; }

.mermaid-err .label text {
fill: #333; }

.mermaid-err .node rect,
.mermaid-err .node circle,
.mermaid-err .node ellipse,
.mermaid-err .node polygon,
.mermaid-err .node path {
fill: #ECECFF;
stroke: #9370DB;
stroke-width: 1px; }

.mermaid-err .node .label {
text-align: center;
fill: #333; }

.mermaid-err .node.clickable {
cursor: pointer; }

.mermaid-err .arrowheadPath {
fill: #333333; }

.mermaid-err .edgePath .path {
stroke: #333333;
stroke-width: 1.5px; }

.mermaid-err .flowchart-link {
stroke: #333333;
fill: none; }

.mermaid-err .edgeLabel {
background-color: #e8e8e8;
text-align: center; }
.mermaid-err   .edgeLabel rect {
opacity: 0.9; }
.mermaid-err   .edgeLabel span {
color: #333; }

.mermaid-err .cluster rect {
fill: #ffffde;
stroke: #aaaa33;
stroke-width: 1px; }

.mermaid-err .cluster text {
fill: #333; }

.mermaid-err div.mermaidTooltip {
position: absolute;
text-align: center;
max-width: 200px;
padding: 2px;
font-family: 'trebuchet ms', verdana, arial;
font-family: var(--mermaid-font-family);
font-size: 12px;
background: #ffffde;
border: 1px solid #aaaa33;
border-radius: 2px;
pointer-events: none;
z-index: 100; }

.mermaid-err .actor {
stroke: #CCCCFF;
fill: #ECECFF; }

.mermaid-err text.actor > tspan {
fill: black;
stroke: none; }

.mermaid-err .actor-line {
stroke: grey; }

.mermaid-err .messageLine0 {
stroke-width: 1.5;
stroke-dasharray: none;
stroke: #333; }

.mermaid-err .messageLine1 {
stroke-width: 1.5;
stroke-dasharray: 2, 2;
stroke: #333; }

.mermaid-err #arrowhead path {
fill: #333;
stroke: #333; }

.mermaid-err .sequenceNumber {
fill: white; }

.mermaid-err #sequencenumber {
fill: #333; }

.mermaid-err #crosshead path {
fill: #333;
stroke: #333; }

.mermaid-err .messageText {
fill: #333;
stroke: #333; }

.mermaid-err .labelBox {
stroke: #CCCCFF;
fill: #ECECFF; }

.mermaid-err .labelText,.mermaid-err  .labelText > tspan {
fill: black;
stroke: none; }

.mermaid-err .loopText,.mermaid-err  .loopText > tspan {
fill: black;
stroke: none; }

.mermaid-err .loopLine {
stroke-width: 2px;
stroke-dasharray: 2, 2;
stroke: #CCCCFF;
fill: #CCCCFF; }

.mermaid-err .note {
stroke: #aaaa33;
fill: #fff5ad; }

.mermaid-err .noteText,.mermaid-err  .noteText > tspan {
fill: black;
stroke: none; }

.mermaid-err .activation0 {
fill: #f4f4f4;
stroke: #666; }

.mermaid-err .activation1 {
fill: #f4f4f4;
stroke: #666; }

.mermaid-err .activation2 {
fill: #f4f4f4;
stroke: #666; }


.mermaid-err .mermaid-main-font {
font-family: "trebuchet ms", verdana, arial;
font-family: var(--mermaid-font-family); }

.mermaid-err .section {
stroke: none;
opacity: 0.2; }

.mermaid-err .section0 {
fill: rgba(102, 102, 255, 0.49); }

.mermaid-err .section2 {
fill: #fff400; }

.mermaid-err .section1,
.mermaid-err .section3 {
fill: white;
opacity: 0.2; }

.mermaid-err .sectionTitle0 {
fill: #333; }

.mermaid-err .sectionTitle1 {
fill: #333; }

.mermaid-err .sectionTitle2 {
fill: #333; }

.mermaid-err .sectionTitle3 {
fill: #333; }

.mermaid-err .sectionTitle {
text-anchor: start;
font-size: 11px;
text-height: 14px;
font-family: 'trebuchet ms', verdana, arial;
font-family: var(--mermaid-font-family); }


.mermaid-err .grid .tick {
stroke: lightgrey;
opacity: 0.8;
shape-rendering: crispEdges; }
.mermaid-err   .grid .tick text {
font-family: 'trebuchet ms', verdana, arial;
font-family: var(--mermaid-font-family); }

.mermaid-err .grid path {
stroke-width: 0; }


.mermaid-err .today {
fill: none;
stroke: red;
stroke-width: 2px; }



.mermaid-err .task {
stroke-width: 2; }

.mermaid-err .taskText {
text-anchor: middle;
font-family: 'trebuchet ms', verdana, arial;
font-family: var(--mermaid-font-family); }

.mermaid-err .taskText:not([font-size]) {
font-size: 11px; }

.mermaid-err .taskTextOutsideRight {
fill: black;
text-anchor: start;
font-size: 11px;
font-family: 'trebuchet ms', verdana, arial;
font-family: var(--mermaid-font-family); }

.mermaid-err .taskTextOutsideLeft {
fill: black;
text-anchor: end;
font-size: 11px; }


.mermaid-err .task.clickable {
cursor: pointer; }

.mermaid-err .taskText.clickable {
cursor: pointer;
fill: #003163 !important;
font-weight: bold; }

.mermaid-err .taskTextOutsideLeft.clickable {
cursor: pointer;
fill: #003163 !important;
font-weight: bold; }

.mermaid-err .taskTextOutsideRight.clickable {
cursor: pointer;
fill: #003163 !important;
font-weight: bold; }


.mermaid-err .taskText0,
.mermaid-err .taskText1,
.mermaid-err .taskText2,
.mermaid-err .taskText3 {
fill: white; }

.mermaid-err .task0,
.mermaid-err .task1,
.mermaid-err .task2,
.mermaid-err .task3 {
fill: #8a90dd;
stroke: #534fbc; }

.mermaid-err .taskTextOutside0,
.mermaid-err .taskTextOutside2 {
fill: black; }

.mermaid-err .taskTextOutside1,
.mermaid-err .taskTextOutside3 {
fill: black; }


.mermaid-err .active0,
.mermaid-err .active1,
.mermaid-err .active2,
.mermaid-err .active3 {
fill: #bfc7ff;
stroke: #534fbc; }

.mermaid-err .activeText0,
.mermaid-err .activeText1,
.mermaid-err .activeText2,
.mermaid-err .activeText3 {
fill: black !important; }


.mermaid-err .done0,
.mermaid-err .done1,
.mermaid-err .done2,
.mermaid-err .done3 {
stroke: grey;
fill: lightgrey;
stroke-width: 2; }

.mermaid-err .doneText0,
.mermaid-err .doneText1,
.mermaid-err .doneText2,
.mermaid-err .doneText3 {
fill: black !important; }


.mermaid-err .crit0,
.mermaid-err .crit1,
.mermaid-err .crit2,
.mermaid-err .crit3 {
stroke: #ff8888;
fill: red;
stroke-width: 2; }

.mermaid-err .activeCrit0,
.mermaid-err .activeCrit1,
.mermaid-err .activeCrit2,
.mermaid-err .activeCrit3 {
stroke: #ff8888;
fill: #bfc7ff;
stroke-width: 2; }

.mermaid-err .doneCrit0,
.mermaid-err .doneCrit1,
.mermaid-err .doneCrit2,
.mermaid-err .doneCrit3 {
stroke: #ff8888;
fill: lightgrey;
stroke-width: 2;
cursor: pointer;
shape-rendering: crispEdges; }

.mermaid-err .milestone {
transform: rotate(45deg) scale(0.8, 0.8); }

.mermaid-err .milestoneText {
font-style: italic; }

.mermaid-err .doneCritText0,
.mermaid-err .doneCritText1,
.mermaid-err .doneCritText2,
.mermaid-err .doneCritText3 {
fill: black !important; }

.mermaid-err .activeCritText0,
.mermaid-err .activeCritText1,
.mermaid-err .activeCritText2,
.mermaid-err .activeCritText3 {
fill: black !important; }

.mermaid-err .titleText {
text-anchor: middle;
font-size: 18px;
fill: black;
font-family: 'trebuchet ms', verdana, arial;
font-family: var(--mermaid-font-family); }

.mermaid-err g.classGroup text {
fill: #9370DB;
stroke: none;
font-family: 'trebuchet ms', verdana, arial;
font-family: var(--mermaid-font-family);
font-size: 10px; }
.mermaid-err   g.classGroup text .title {
font-weight: bolder; }

.mermaid-err g.clickable {
cursor: pointer; }

.mermaid-err g.classGroup rect {
fill: #ECECFF;
stroke: #9370DB; }

.mermaid-err g.classGroup line {
stroke: #9370DB;
stroke-width: 1; }

.mermaid-err .classLabel .box {
stroke: none;
stroke-width: 0;
fill: #ECECFF;
opacity: 0.5; }

.mermaid-err .classLabel .label {
fill: #9370DB;
font-size: 10px; }

.mermaid-err .relation {
stroke: #9370DB;
stroke-width: 1;
fill: none; }

.mermaid-err .dashed-line {
stroke-dasharray: 3; }

.mermaid-err #compositionStart {
fill: #9370DB;
stroke: #9370DB;
stroke-width: 1; }

.mermaid-err #compositionEnd {
fill: #9370DB;
stroke: #9370DB;
stroke-width: 1; }

.mermaid-err #aggregationStart {
fill: #ECECFF;
stroke: #9370DB;
stroke-width: 1; }

.mermaid-err #aggregationEnd {
fill: #ECECFF;
stroke: #9370DB;
stroke-width: 1; }

.mermaid-err #dependencyStart {
fill: #9370DB;
stroke: #9370DB;
stroke-width: 1; }

.mermaid-err #dependencyEnd {
fill: #9370DB;
stroke: #9370DB;
stroke-width: 1; }

.mermaid-err #extensionStart {
fill: #9370DB;
stroke: #9370DB;
stroke-width: 1; }

.mermaid-err #extensionEnd {
fill: #9370DB;
stroke: #9370DB;
stroke-width: 1; }

.mermaid-err .commit-id,
.mermaid-err .commit-msg,
.mermaid-err .branch-label {
fill: lightgrey;
color: lightgrey;
font-family: 'trebuchet ms', verdana, arial;
font-family: var(--mermaid-font-family); }

.mermaid-err .pieTitleText {
text-anchor: middle;
font-size: 25px;
fill: black;
font-family: 'trebuchet ms', verdana, arial;
font-family: var(--mermaid-font-family); }

.mermaid-err .slice {
font-family: 'trebuchet ms', verdana, arial;
font-family: var(--mermaid-font-family); }

.mermaid-err g.stateGroup text {
fill: #9370DB;
stroke: none;
font-size: 10px;
font-family: 'trebuchet ms', verdana, arial;
font-family: var(--mermaid-font-family); }

.mermaid-err g.stateGroup text {
fill: #9370DB;
fill: #333;
stroke: none;
font-size: 10px; }

.mermaid-err g.statediagram-cluster .cluster-label text {
fill: #333; }

.mermaid-err g.stateGroup .state-title {
font-weight: bolder;
fill: black; }

.mermaid-err g.stateGroup rect {
fill: #ECECFF;
stroke: #9370DB; }

.mermaid-err g.stateGroup line {
stroke: #9370DB;
stroke-width: 1; }

.mermaid-err .transition {
stroke: #9370DB;
stroke-width: 1;
fill: none; }

.mermaid-err .stateGroup .composit {
fill: white;
border-bottom: 1px; }

.mermaid-err .stateGroup .alt-composit {
fill: #e0e0e0;
border-bottom: 1px; }

.mermaid-err .state-note {
stroke: #aaaa33;
fill: #fff5ad; }
.mermaid-err   .state-note text {
fill: black;
stroke: none;
font-size: 10px; }

.mermaid-err .stateLabel .box {
stroke: none;
stroke-width: 0;
fill: #ECECFF;
opacity: 0.7; }

.mermaid-err .edgeLabel text {
fill: #333; }

.mermaid-err .stateLabel text {
fill: black;
font-size: 10px;
font-weight: bold;
font-family: 'trebuchet ms', verdana, arial;
font-family: var(--mermaid-font-family); }

.mermaid-err .node circle.state-start {
fill: black;
stroke: black; }

.mermaid-err .node circle.state-end {
fill: black;
stroke: white;
stroke-width: 1.5; }

.mermaid-err #statediagram-barbEnd {
fill: #9370DB; }

.mermaid-err .statediagram-cluster rect {
fill: #ECECFF;
stroke: #9370DB;
stroke-width: 1px; }

.mermaid-err .statediagram-cluster rect.outer {
rx: 5px;
ry: 5px; }

.mermaid-err .statediagram-state .divider {
stroke: #9370DB; }

.mermaid-err .statediagram-state .title-state {
rx: 5px;
ry: 5px; }

.mermaid-err .statediagram-cluster.statediagram-cluster .inner {
fill: white; }

.mermaid-err .statediagram-cluster.statediagram-cluster-alt .inner {
fill: #e0e0e0; }

.mermaid-err .statediagram-cluster .inner {
rx: 0;
ry: 0; }

.mermaid-err .statediagram-state rect.basic {
rx: 5px;
ry: 5px; }

.mermaid-err .statediagram-state rect.divider {
stroke-dasharray: 10,10;
fill: #efefef; }

.mermaid-err .note-edge {
stroke-dasharray: 5; }

.mermaid-err .statediagram-note rect {
fill: #fff5ad;
stroke: #aaaa33;
stroke-width: 1px;
rx: 0;
ry: 0; }

:root {
--mermaid-font-family: '"trebuchet ms", verdana, arial';
--mermaid-font-family: "Comic Sans MS", "Comic Sans", cursive; }


.mermaid-err .error-icon {
fill: #552222; }

.mermaid-err .error-text {
fill: #552222;
stroke: #552222; }

.mermaid-err .edge-thickness-normal {
stroke-width: 2px; }

.mermaid-err .edge-thickness-thick {
stroke-width: 3.5px; }

.mermaid-err .edge-pattern-solid {
stroke-dasharray: 0; }

.mermaid-err .edge-pattern-dashed {
stroke-dasharray: 3; }

.mermaid-err .edge-pattern-dotted {
stroke-dasharray: 2; }

.mermaid-err .marker {
fill: #333333; }

.mermaid-err .marker.cross {
stroke: #333333; }

:root { --mermaid-font-family: "trebuchet ms", verdana, arial;}</style><style>.mermaid-err {
color: rgb(0, 0, 0);
font: 18px / 27px Inter;
}</style><g></g><g><path class="error-icon" d="m411.313,123.313c6.25-6.25 6.25-16.375 0-22.625s-16.375-6.25-22.625,0l-32,32-9.375,9.375-20.688-20.688c-12.484-12.5-32.766-12.5-45.25,0l-16,16c-1.261,1.261-2.304,2.648-3.31,4.051-21.739-8.561-45.324-13.426-70.065-13.426-105.867,0-192,86.133-192,192s86.133,192 192,192 192-86.133 192-192c0-24.741-4.864-48.327-13.426-70.065 1.402-1.007 2.79-2.049 4.051-3.31l16-16c12.5-12.492 12.5-32.758 0-45.25l-20.688-20.688 9.375-9.375 32.001-31.999zm-219.313,100.687c-52.938,0-96,43.063-96,96 0,8.836-7.164,16-16,16s-16-7.164-16-16c0-70.578 57.422-128 128-128 8.836,0 16,7.164 16,16s-7.164,16-16,16z"></path><path class="error-icon" d="m459.02,148.98c-6.25-6.25-16.375-6.25-22.625,0s-6.25,16.375 0,22.625l16,16c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688 6.25-6.25 6.25-16.375 0-22.625l-16.001-16z"></path><path class="error-icon" d="m340.395,75.605c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688 6.25-6.25 6.25-16.375 0-22.625l-16-16c-6.25-6.25-16.375-6.25-22.625,0s-6.25,16.375 0,22.625l15.999,16z"></path><path class="error-icon" d="m400,64c8.844,0 16-7.164 16-16v-32c0-8.836-7.156-16-16-16-8.844,0-16,7.164-16,16v32c0,8.836 7.156,16 16,16z"></path><path class="error-icon" d="m496,96.586h-32c-8.844,0-16,7.164-16,16 0,8.836 7.156,16 16,16h32c8.844,0 16-7.164 16-16 0-8.836-7.156-16-16-16z"></path><path class="error-icon" d="m436.98,75.605c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688l32-32c6.25-6.25 6.25-16.375 0-22.625s-16.375-6.25-22.625,0l-32,32c-6.251,6.25-6.251,16.375-0.001,22.625z"></path><text class="error-text" x="1240" y="350" font-size="150px" style="text-anchor: middle;">Syntax error in graph</text></g></svg>
`;
