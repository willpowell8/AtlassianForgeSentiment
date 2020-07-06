import ForgeUI, { render, Fragment, Text, IssuePanel, Image, useProductContext, Lozenge, useState,  Table, Head, Row, Cell, ModalDialog, Button } from '@forge/ui';

const fetchCommentsForIssue = async (issueId) => {
  const res = await api
    .asApp()
    .requestJira(`/rest/api/3/issue/${issueId}/comment`);

  const data = await res.json();
  return data.comments;
};

function process(review){
  /* NORMALIZATION */
  var Sentiment = require('sentiment');
  var sentiment = new Sentiment();
  return sentiment.analyze(review);
}

const fetchForIssue = async (issueId) => {
  const res = await api
    .asApp()
    .requestJira(`/rest/api/3/issue/${issueId}`);
  const data = await res.json();
  return data;
};

const App = () => {
  const context = useProductContext();
  const [isOpen, setOpen] = useState(false);
  
  const issue = useState(async () => await fetchForIssue(context.platformContext.issueKey));
  var analysis;

  var rows = [];
  if(issue[0].fields.description != null) {
    var description = issue[0].fields.description;
    console.log(description);
    var bodyElements = [];
    switch(description.type){
      case "doc":
        var content = description.content;
        console.log(description.content);
        var text =[];
        content.forEach(element => {
          var output = [];
          element.content.forEach(c =>{
            output.push(c.text);
          })
          text.push(output.join(" "));
        });
        var finalText = text.join("\n")
        bodyElements.push(finalText);
        console.log(finalText);
        analysis = process(finalText);
        var words = [];
        analysis.positive.forEach(pos => {
          var newBodyElements = []
          bodyElements.forEach(function(item){
            if(typeof item === 'string' || item instanceof String){
            var splitElement = item.split(pos)
            if(splitElement.length > 1){
              for(var i = 0; i<splitElement.length; i++){
                newBodyElements.push(splitElement[i]);
                if(i<(splitElement.length-1)){
                  newBodyElements.push(<Lozenge text={pos} appearance="success" />)
                }
              }
            }else{
              newBodyElements.push(item)
            }
          }else{
            newBodyElements.push(item)
          }
          })
          bodyElements = newBodyElements
          words.push(<Lozenge text={pos} appearance="success" />)
        })
        analysis.negative.forEach(pos => {
          var newBodyElements = []
          bodyElements.forEach(function(item){
            if(typeof item === 'string' || item instanceof String){
              var splitElement = item.split(pos)
              if(splitElement.length > 1){
                for(var i = 0; i<splitElement.length; i++){
                  newBodyElements.push(splitElement[i]);
                  if(i<(splitElement.length-1)){
                    newBodyElements.push(<Lozenge text={pos} appearance="removed" />)
                  }
                }
              }else{
                newBodyElements.push(item)
              }
            }else{
              newBodyElements.push(item)
            }
          })
          bodyElements = newBodyElements
          words.push(<Lozenge text={pos} appearance="removed" />)
        })
        rows.push((<Row>
          <Cell><Text>Description</Text></Cell>
          <Cell><Text>{analysis.score}</Text></Cell>
          <Cell><Text>{analysis.comparative}</Text></Cell>
          <Cell><Text>{words}</Text></Cell>
        </Row>))
        break;
    }
  }
  var titleElements = [];
  if(issue[0].fields.summary != null){
    var title = issue[0].fields.summary;
    console.log(issue[0]);
    
    titleElements.push(title);
    var titleAnalysis = process(title);
    var words = [];
    titleAnalysis.positive.forEach(pos => {
      var newTitleElements = []
          titleElements.forEach(function(item){
            if(typeof item === 'string' || item instanceof String){
              var splitElement = item.split(pos)
              if(splitElement.length > 1){
                for(var i = 0; i<splitElement.length; i++){
                  newTitleElements.push(splitElement[i]);
                  if(i<(splitElement.length-1)){
                    newTitleElements.push(<Lozenge text={pos} appearance="success" />)
                  }
                }
              }else{
                newTitleElements.push(item)
              }
            }else{
              newTitleElements.push(item)
            }
          })
          titleElements = newTitleElements
      words.push(<Lozenge text={pos} appearance="success" />)
    })
    titleAnalysis.negative.forEach(pos => {
      var newTitleElements = []
          titleElements.forEach(function(item){
            if(typeof item === 'string' || item instanceof String){
              var splitElement = item.split(pos)
              if(splitElement.length > 1){
                for(var i = 0; i<splitElement.length; i++){
                  newTitleElements.push(splitElement[i]);
                  if(i<(splitElement.length-1)){
                    newTitleElements.push(<Lozenge text={pos} appearance="removed" />)
                  }
                }
              }else{
                newTitleElements.push(item)
              }
            }else{
              newTitleElements.push(item)
            }
          })
          titleElements = newTitleElements
      words.push(<Lozenge text={pos} appearance="removed" />)
    })
    rows.push((<Row>
      <Cell><Text>Summary</Text></Cell>
      <Cell><Text>{titleAnalysis.score}</Text></Cell>
      <Cell><Text>{titleAnalysis.comparative}</Text></Cell>
      <Cell><Text>{words}</Text></Cell>
    </Row>))
  }
  //http://willpowell.co.uk/jira/negative.png
  //http://willpowell.co.uk/jira/neutral.png
  //http://willpowell.co.uk/jira/positive.png
  //http://willpowell.co.uk/jira/slightlynegative.png
  //http://willpowell.co.uk/jira/slightlypositive.png
  if(analysis != null){
    bodyElements.push(" ");
    titleElements.push(" ");
    return (
      <Fragment>
        <Image src="http://willpowell.co.uk/jira/negative.png" alt="homer"/>
        <Text>Score {analysis.score}</Text>
        <Button
        text={`View Breakdown`}
        onClick={() => setOpen(true)}
      />
      {isOpen && (
        <ModalDialog header="Ticket Sentiment" onClose={() => setOpen(false)}>
          <Table>
            <Head>
              <Cell><Text>Area</Text></Cell>
              <Cell><Text>Score</Text></Cell>
              <Cell><Text>Weighted</Text></Cell>
              <Cell><Text>Words</Text></Cell>
            </Head>
            {rows}
          </Table>
          <Text>{titleElements}</Text>
          <Text>{bodyElements}</Text>
        </ModalDialog>
      )}
      </Fragment>
    );
  }
  
  return (
    <Fragment>
      <Text>Could not find text to analyse</Text>
    </Fragment>
  );
};

export const run = render(
  <IssuePanel>
    <App />
  </IssuePanel>
);
