import React from 'react'
import { Bar } from 'react-chartjs-2'

const BOOKINGS_BUCKETS = {
    Cheap: { min: 0, max: 100 },
    Normal: { min: 100, max: 200 },
    Expensive: { min: 200, max: 100000000 }
}

const bookingsChart = props => {

    const chartData = { labels: [], datasets: [] }
    for (const bucket in BOOKINGS_BUCKETS) {
        const filteredBookingsCount = props.bookings.reduce((prev, current) => {
            if (BOOKINGS_BUCKETS[bucket].min < parseFloat(current.event.price) && parseFloat(current.event.price) <= BOOKINGS_BUCKETS[bucket].max) {
                return prev + 1;
            } else {
                return prev;
            }
        }, 0);
        chartData.labels.push(bucket)
        chartData.datasets.push(filteredBookingsCount)
    }
    const data = {
        labels: chartData.labels,
        datasets: [
            {
                label: '# of Event',
                data: chartData.datasets,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                    },
                },
            ],
        },
    };

    return <Bar data={data} options={options} />
}

export default bookingsChart;