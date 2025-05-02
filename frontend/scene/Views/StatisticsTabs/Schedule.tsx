import {SvgChart, SVGRenderer} from '@wuba/react-native-echarts';
import * as echarts from 'echarts/core';
import {useRef, useEffect, useMemo, useCallback} from 'react';
import {BarChart} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from 'echarts/components';
import React, {useState} from 'react';
import {LayoutChangeEvent, View, ScrollView} from 'react-native';
import {get_word_status} from '../../../request/word';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  SVGRenderer,
  BarChart,
]);
function Schedule() {
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(0);
  const [series, setSeries] = useState<any[]>([]);
  const [statusesLegend, setStatusesLegend] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const option = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        data: statusesLegend,
        textStyle: {
          fontSize: 14,
          color: '#dbc4c4',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          interval: 0,  // 每个标签都显示
          rotate: 45,   // 旋转以防重叠
        },
      },
      yAxis: {
        type: 'value',
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: 0,
          start: 70, // 初始显示范围（可调）
          end: 100,
        },
      ],
      series: [
        ...series,
        {
          name: 'daily_goal',
          type: 'bar',
          stack: null,
          itemStyle: { color: '#ccc', opacity: 0.3 },
          data: Array(dates.length).fill(dailyGoal),
        },
      ],
    };
  }, [statusesLegend, series, dailyGoal, dates]);
  const handleLayout = (event: LayoutChangeEvent) => {
    const {height: layoutHeight, width: layoutWidth} = event.nativeEvent.layout;
    setHeight(layoutHeight - 100);
    setWidth(layoutWidth);
  };

  const chartRef = useRef<any>(null);
  useFocusEffect(useCallback(()=>{
    const initScheduleChart = async () => {
      const res = await get_word_status();
      const userInfoJSON = await AsyncStorage.getItem('userInfo');

      const dailyGoal = JSON.parse(userInfoJSON!).daily_goal;
      setDailyGoal(dailyGoal);

      // 👉 1. 构造过去 30 天的日期
      const today = new Date();
      const allDates: string[] = [];
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        allDates.unshift(d.toISOString().slice(0, 10)); // YYYY-MM-DD
      }

      // 👉 2. 提取所有 memory_status
      const statusSet = new Set<string>();
      const grouped: Record<string, Record<string, number>> = {};

      for (const row of res) {
        const { date, memory_status, count } = row;
        statusSet.add(memory_status);
        if (!grouped[date]) {grouped[date] = {};}
        grouped[date][memory_status] = count;
      }

      const statuses = Array.from(statusSet);
      setStatusesLegend(statuses);
      setDates(allDates);

      // 👉 3. 构建 series，确保每个日期都有对应值（默认为 0）
      const filledSeries = statuses.map(status => ({
        name: status,
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        data: allDates.map(date => grouped[date]?.[status] || 0),
      }));

      setSeries(filledSeries);
    };
    initScheduleChart();
  },[]));
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
export default Schedule;
