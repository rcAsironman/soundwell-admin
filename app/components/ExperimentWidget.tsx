'use client'

import { Card, Typography } from "@mui/material"



const tagCss = {
    color: 'black',
    fontSize: 14,
    fontWeight: 600,
    marginLeft: '10%',
    marginTop: '6%',
}

const valueCss = {
    color: 'green',
    fontSize: 12,
    fontWeight: 500,
    marginLeft: '10%',
    marginTop: '1%',
}


export default function ExperimentWidget() {


    const total_experiments = 100;
    const experiment_assigned_to_users = 50;
    const total_users = 1000;
    const active_users = 800;
    const active_experiments = 50;
    const total_phrases = 200;
    const users_assigned = 200;

    return (
        <Card

            sx={{
                height: '50%',
                width: '28%',
                bgcolor: 'white',
                borderRadius: 6,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'start',
                alignItems: 'start',
                overflow: 'auto'
            }}
        >
            <Typography sx={[tagCss, {fontSize: 22}]}>Experiments</Typography>
            <Typography sx={tagCss}>Total Experiments</Typography>
            <Typography sx={valueCss} >{total_experiments}</Typography>

            <Typography sx={tagCss} >Active Experiments</Typography>
            <Typography sx={valueCss}>{active_experiments}</Typography>

            <Typography sx={tagCss} >users Assigned</Typography>
            <Typography sx={valueCss}>{users_assigned}</Typography>
            <Typography sx={tagCss}>Submitted</Typography>
            <Typography sx={valueCss}>{users_assigned}</Typography>
            <Typography sx={tagCss}>Pending</Typography>
            <Typography
                sx={{
                    color: 'red',
                    fontSize: 12,
                    fontWeight: 600,
                    marginLeft: '10%',
                    marginTop: '1%',
                }}
            >{users_assigned}</Typography>

        </Card>
    )
}