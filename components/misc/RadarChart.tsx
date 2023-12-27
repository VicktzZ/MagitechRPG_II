import React, { type CSSProperties, type ReactElement } from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    type ChartData,
    type CoreChartOptions,
    type ElementChartOptions,
    type PluginChartOptions,
    type DatasetChartOptions,
    type ScaleChartOptions
} from 'chart.js';

import { Radar } from 'react-chartjs-2';
import { type _DeepPartialObject } from '@node_modules/chart.js/dist/types/utils';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

type ChartOptions = 
    _DeepPartialObject<CoreChartOptions<'radar'>> &
    ElementChartOptions<'radar'> &
    PluginChartOptions<'radar'> &
    DatasetChartOptions<'radar'> &
    ScaleChartOptions<'radar'>

export default function RadarChart({
    data,
    style,
    options 
}: { 
    data: ChartData<'radar', Array<number | null>, unknown>,
    style?: CSSProperties
    options?: ChartOptions | any
}): ReactElement {
    return <Radar style={style} options={options} data={data} />;
}
