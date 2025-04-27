import {SvgChart, SVGRenderer} from '@wuba/react-native-echarts';
import * as echarts from 'echarts/core';
import {useRef, useEffect, useMemo} from 'react';
import {LineChart} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from 'echarts/components';
import React, {useState} from 'react';
import {LayoutChangeEvent, View, ScrollView} from 'react-native';
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  SVGRenderer,
  LineChart,
]);
function ForgetCurve() {
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const option = useMemo(() => {
    return {
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: [120, 200, 150, 80, 70, 110, 130],
          type: 'line',
        },
      ],
    };
  },[]);
  const handleLayout = (event: LayoutChangeEvent) => {
    const {height: layoutHeight, width: layoutWidth} = event.nativeEvent.layout;
    setHeight(layoutHeight - 100);
    setWidth(layoutWidth - 100);
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
