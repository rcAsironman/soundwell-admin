import * as React from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HomeIcon from '@mui/icons-material/Home';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarBorder from '@mui/icons-material/StarBorder';
import { useState } from 'react';
import { Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { usePathname, useRouter } from 'next/navigation';
import CreateIcon from '@mui/icons-material/Create';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';

const optionSelectedOrNot = {
    '&.Mui-selected': {
        backgroundColor: 'white',
        color: 'black',
        borderRadius: 20,
    },


}
export default function NavBar() {


    const router = useRouter();
    const pathName = usePathname();


    const [openSection, setOpenSection] = useState('');
    const [selected, setSelected] = useState('homePage')


    const handleClick = (section: string) => {

        setOpenSection((prev) => (prev == section ? prev == 'update' ? 'phrase' : '' : section));

    };


    const handleSelectOption = (option: string) => {
        setSelected(option);
        router.push(`/${option}`);
    }

    return (
        <List
            sx={{ width: '100%', maxWidth: 400, color: 'white', }}
            component="nav"
            aria-labelledby="nested-list-subheader"

        >
            <ListItemButton
                selected={pathName == '/homePage'}
                onClick={() => handleSelectOption('homePage')}
                sx={optionSelectedOrNot}
            >
                <ListItemIcon>
                    <HomeIcon sx={{ color: pathName == '/homePage' ? 'black' : 'white' }} />
                </ListItemIcon>
                <ListItemText primary="Home" />
            </ListItemButton>




            {/**account management */}
            <ListItemButton onClick={() => handleClick('account')}>
                <ListItemIcon>
                    <AddIcon sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="Account" />
                {openSection === 'account' ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSection === 'account'} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <ListItemButton
                        selected={pathName == '/createUser'}
                        onClick={() => handleSelectOption('createUser')}
                        sx={[optionSelectedOrNot, { pl: 4 }]}
                    >
                        <ListItemIcon>
                            <PersonAddIcon sx={{ color: pathName == '/createUser' ? 'black' : 'white' }} />
                        </ListItemIcon>
                        <ListItemText primary="Create User Account" />
                    </ListItemButton>


                    <ListItemButton
                        selected={pathName == '/createAdmin'}
                        onClick={() => handleSelectOption('createAdmin')}
                        sx={[optionSelectedOrNot, { pl: 4 }]}
                    >
                        <ListItemIcon>
                            <PersonAddIcon sx={{ color: pathName == '/createAdmin' ? 'black' : 'white' }} />
                        </ListItemIcon>
                        <ListItemText primary="Create Admin Account" />
                    </ListItemButton>
                </List>
            </Collapse>


            {/**Phrase management */}
            <ListItemButton onClick={() => handleClick('phrase')}>
                <ListItemIcon>
                    <CreateIcon sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="Phrase" />
                {openSection === 'phrase' ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSection === 'phrase' || openSection === 'update'} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>

                    <ListItemButton
                        selected={pathName == '/createPhrase'}
                        onClick={() => handleSelectOption('createPhrase')}
                        sx={[optionSelectedOrNot, { pl: 4 }]}
                    >
                        <ListItemIcon>
                            <CreateIcon sx={{ color: pathName == '/createPhrase' ? 'black' : 'white' }} />
                        </ListItemIcon>
                        <ListItemText primary="Create Phrase" />
                    </ListItemButton>


                    <ListItemButton
                        selected={pathName == '/updatePhrase'}
                        onClick={() => handleSelectOption('updatePhrase')}
                        sx={[optionSelectedOrNot, { pl: 4 }]}
                    >
                        <ListItemIcon>
                            <PersonAddIcon sx={{ color: pathName == '/updatePhrase' ? 'black' : 'white' }} />
                        </ListItemIcon>
                        <ListItemText primary="Update Phrase" />
                    </ListItemButton>





                    <ListItemButton
                        selected={pathName == '/deletePhrase'}
                        onClick={() => handleSelectOption('deletePhrase')}
                        sx={[optionSelectedOrNot, { pl: 4 }]}
                    >
                        <ListItemIcon>
                            <DeleteIcon sx={{ color: pathName == '/deletePhrase' ? 'black' : 'white' }} />
                        </ListItemIcon>
                        <ListItemText primary="Delete Phrase" />
                    </ListItemButton>
                </List>
            </Collapse>

            {/**Experiment */}
            <ListItemButton onClick={() => handleClick('experiment')}>
                <ListItemIcon>
                    <CreateIcon sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="Experiment" />
                {openSection === 'experiment' ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSection === 'experiment'} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>

                    <ListItemButton
                        selected={pathName == '/createExperiment'}
                        onClick={() => handleSelectOption('createExperiment')}
                        sx={[optionSelectedOrNot, { pl: 4 }]}
                    >
                        <ListItemIcon>
                            <CreateIcon sx={{ color: pathName == '/createExperiment' ? 'black' : 'white' }} />
                        </ListItemIcon>
                        <ListItemText primary="Create Experiment" />
                    </ListItemButton>


                    <ListItemButton
                        selected={pathName == '/updateExperiment'}
                        onClick={() => handleSelectOption('updateExperiment')}
                        sx={[optionSelectedOrNot, { pl: 4 }]}
                    >
                        <ListItemIcon>
                            <EditNoteIcon sx={{ color: pathName == '/updateExperiment' ? 'black' : 'white' }} />
                        </ListItemIcon>
                        <ListItemText primary="Update Experiment" />
                    </ListItemButton>

                    <ListItemButton
                        selected={pathName == '/deleteExperiment'}
                        onClick={() => handleSelectOption('deleteExperiment')}
                        sx={[optionSelectedOrNot, { pl: 4 }]}
                    >
                        <ListItemIcon>
                            <DeleteIcon sx={{ color: pathName == '/deleteExperiment' ? 'black' : 'white' }} />
                        </ListItemIcon>
                        <ListItemText primary="Delete Experiment" />
                    </ListItemButton>
                </List>
            </Collapse>

            {/**User Managament */}

            {/**Download center */}
            {/** Download CSV */}
            <ListItemButton
                selected={pathName == '/downloadCsv'}
                onClick={() => handleSelectOption('downloadCsv')}
                sx={optionSelectedOrNot}
            >
                <ListItemIcon>
                    <DownloadIcon
                        sx={{ color: pathName == '/downloadCsv' ? 'black' : 'white' }}
                    />
                </ListItemIcon>
                <ListItemText primary="Download CS" />
            </ListItemButton>
            {/**Help Center */}


        </List>
    );
}
