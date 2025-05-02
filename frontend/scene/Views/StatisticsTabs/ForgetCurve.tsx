import {SvgChart, SVGRenderer} from '@wuba/react-native-echarts';
import * as echarts from 'echarts/core';
import {useRef, useEffect, useMemo} from 'react';
import {LineChart} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LegendComponent,
} from 'echarts/components';
import React, {useState} from 'react';
import {LayoutChangeEvent, View, ScrollView} from 'react-native';
import { generateSM2MemoryCurve, getCurvePoints } from '../../../utils/sm2';
echarts.use([
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  SVGRenderer,
  LineChart,
  DataZoomComponent,
]);
function ForgetCurve() {
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const option = useMemo(() => {
    return {
      legend: {
        data: ['Ebbinghaus', 'Have review'],  // 图例项，通常等于 series.name
        orient: 'horizontal',      // horizontal / vertical
        left: 'center',
        textStyle: {
          fontSize: 14,
          color: '#dbc4c4',
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: getCurvePoints().map(item => item.day),
        axisLabel: {
          formatter: '{value}day',
        },
        axisLine:{
          lineStyle: {
            color: '#ffffff', // 坐标轴线颜色
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%',
        },
        axisLine:{
          show: true, // ✅ 显示 y 轴线
          lineStyle: {
            color: '#ffffff', // 坐标轴线颜色
          },
        },
      },
      series: [
        {
          name: 'Ebbinghaus',
          data: getCurvePoints().map(item => item.retention),
          type: 'line',
          symbolSize: 10,
          lineStyle: {
            color: '#FF6F61',   // 自定义颜色（如红橙色）
            width: 4,            // 线条粗细（默认是 2）
            type: 'solid',       // 可选：'solid' | 'dashed' | 'dotted'
          },
          itemStyle: {
            color: '#FF6F61',     // 圆点颜色也一致
          },
        },
        {
          name: 'Have review',
          data: generateSM2MemoryCurve({
            totalDays: 60,
            initialEasiness: 2.5,
            qualityPerReview: 1.3,
          }).map(item => item.retention),
          type: 'line',
          symbolSize: 10,
          lineStyle: {
            color: '#619bff',   // 自定义颜色（如红橙色）
            width: 4,            // 线条粗细（默认是 2）
            type: 'solid',       // 可选：'solid' | 'dashed' | 'dotted'
          },
          itemStyle: {
            color: '#619bff',     // 圆点颜色也一致
          },
        },
      ],
      grid:{
        left: '12%',
      },
      tooltip:{
        trigger: 'axis',
        formatter: function (params: any) {
          return params[0].axisValueLabel + 'day' + '\nretention: ' + params[0].value + '%';
        },
      },
      dataZoom: [
        {
          type: 'slider',
          start: 0,
          end: 30,
        },
        {
          start: 0,
          end: 30,
        },
      ],
    };
  },[]);
  const handleLayout = (event: LayoutChangeEvent) => {
    const {height: layoutHeight, width: layoutWidth} = event.nativeEvent.layout;
    setHeight(layoutHeight - 100);
    setWidth(layoutWidth);
  };

  const chartRef = useRef<any>(null);

  useEffect(() => {
    let chart: any;
    if (chartRef.current) {
      // @ts-ignore
      chart = echarts.init(chartRef.current, 'light', {
        renderer: 'svg',
        width: width,
        height: height,
      });
      chart.setOption(option);
    }
    return () => chart?.dispose();
  }, [option, width, height]);

  return (
    <View style={{flex: 1}}>
      <ScrollView
        style={{
          flex: 1,
          marginHorizontal: 20,
        }}
        onLayout={handleLayout}>
          <SvgChart ref={chartRef} />
        </ScrollView>
    </View>
  );
}
export default ForgetCurve;
