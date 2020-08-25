import React, { FunctionComponent, ReactElement } from 'react';
import {
  Header, Logo, PageTitle, TabList, TabListItem, Link,
} from 'mark-one';
import { useRouteMatch } from 'react-router-dom';
import logo from 'client/img/seas-logo.svg';


const AppHeader: FunctionComponent = (): ReactElement => {
  const tabs: { link: string; text: string }[] = [
    { link: '/courses', text: 'Courses' },
    { link: '/non-class-meetings', text: 'Non class meetings' },
    { link: '/faculty', text: 'Faculty' },
    { link: '/schedule', text: 'Schedule' },
    { link: '/four-year-plan', text: '4 Year Plan' },
    { link: '/course-admin', text: 'Course Admin' },
    { link: '/faculty-admin', text: 'Faculty Admin' },
  ];

  return (
    <>
      <Header justify="left">
        <Logo href="/" image={logo}>SEAS Logo</Logo>
        <PageTitle>Course Planning</PageTitle>
      </Header>
      <nav>
        <TabList>
          {tabs.map((tab): ReactElement => (
            <TabListItem
              isActive={Boolean(useRouteMatch({ path: tab.link }))}
              key={tab.text}
            >
              <Link to={tab.link}>
                {tab.text}
              </Link>
            </TabListItem>
          ))}
        </TabList>
      </nav>
    </>
  );
};

export default AppHeader;
