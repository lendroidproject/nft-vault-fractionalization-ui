import ReactECharts from 'echarts-for-react'
import { currencyFormatter } from 'utils/number'

const option = ({ title, value, max }) => ({
  title: {
    show: true,
    text: title,
    top: '0',
    left: '50%',
    textAlign: 'center',
    padding: 0,
    textStyle: {
      fontFamily: "'Goldman', cursive",
      fontSize: 12,
      fontWeight: 'normal',
      color: '#828282',
    },
  },
  series: [
    {
      type: 'gauge',
      progress: {
        show: false,
        width: 6,
      },
      axisLine: {
        lineStyle: {
          width: 6,
          color: [
            [0.25, '#E2574C'],
            [0.5, '#F4B459'],
            [0.75, '#EFC75E'],
            [1.0, '#3DB39E'],
          ],
        },
        roundCap: true,
      },
      axisTick: {
        show: false,
      },
      splitNumber: 1,
      splitLine: {
        show: false,
      },
      axisLabel: {
        distance: -55,
        fontFamily: "'Goldman', cursive",
        textAlign: 'right',
        formatter: function (value) {
          return currencyFormatter((value * max) / 100)
        },
      },
      anchor: {
        show: true,
        showAbove: true,
        size: 7,
        itemStyle: {
          borderWidth: 0,
          color: '#1E2D36',
        },
      },
      pointer: {
        show: true,
        // icon: `image://${window.location.protocol}//${window.location.host}/assets/speedo-meter-hands.png`,
        keepAspect: true,
        length: '100%',
        width: 3,
        itemStyle: {
          color: '#324D5B',
        },
      },
      textStyle: {
        fontFamily: "'Goldman', cursive",
      },
      detail: {
        valueAnimation: true,
        fontFamily: "'Goldman', cursive",
        fontSize: 8,
        lineHeight: 1.3,
        borderRadius: 15,
        color: 'white',
        backgroundColor: '#CE1FCA',
        offsetCenter: [0, '80%'],
        formatter: function (value) {
          return `${value.toFixed(2)} %`
        },
        width: 100,
        height: 20,
      },
      data: [
        {
          value,
          detail: {
            fontSize: 20,
          },
        },
      ],
      startAngle: 200,
      endAngle: -20,
    },
  ],
})

export default function Gauge({ title = 'Veto Meter', value, max, height = 180 }) {
  return (
    <ReactECharts
      option={option({ title: `${title} (${currencyFormatter((value * max) / 100)})`, value, max })}
      style={{ height, marginBottom: -25, minWidth: 200 }}
    />
  )
}
