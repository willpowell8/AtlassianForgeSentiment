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

const fetchCommentsIssue = async (issueId) => {
  const res = await api
    .asApp()
    .requestJira(`/rest/api/3/issue/${issueId}/comment`);
  const data = await res.json();
  return data;
};

const App = () => {
  const context = useProductContext();
  const [isOpen, setOpen] = useState(false);
  
  const issue = useState(async () => await fetchForIssue(context.platformContext.issueKey));
  var count = 0
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
        if(finalText.length > 0){
          var analysis = process(finalText);
          if(analysis != null){
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
          count += analysis.score
          rows.push((<Row>
            <Cell><Text>Description</Text></Cell>
            <Cell><Text>{analysis.score}</Text></Cell>
            <Cell><Text>{analysis.comparative.toFixed(4)}</Text></Cell>
            <Cell><Text>{words}</Text></Cell>
          </Row>))
          }
        }
        break;
    }
  }
  var titleElements = [];
  if(issue[0].fields.summary != null && issue[0].fields.summary.length > 0){
    var title = issue[0].fields.summary;
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
    count += analysis.score
    rows.push((<Row>
      <Cell><Text>Summary</Text></Cell>
      <Cell><Text>{titleAnalysis.score}</Text></Cell>
      <Cell><Text>{titleAnalysis.comparative.toFixed(4)}</Text></Cell>
      <Cell><Text>{words}</Text></Cell>
    </Row>))
  }

  const commentsData =  useState(async () => await fetchCommentsIssue(context.platformContext.issueKey));
  console.log("COMMENTS1")
  console.log(commentsData)
  if(commentsData[0]['comments'] != null && commentsData[0]['comments'].length > 0){
    console.log("COMMENTS2")
    let comments = commentsData[0]['comments']
    var parts = []
    comments.forEach(function(comment){
      var body = comment["body"]["content"]
      body.forEach(function(bodyPart){
        console.log(bodyPart)
        if(bodyPart["content"] != null && bodyPart["content"].length > 0){
          var bodyPartContent = bodyPart["content"]
          bodyPartContent.forEach(function(c){
            if(c["text"] != null && c["text"].length > 0){
              parts.push(c["text"])
            }
          })
          
        }
        
      })
    })
    var str = parts.join(" ");
    var titleAnalysis = process(str);
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
          count += analysis.score/2
      words.push(<Lozenge text={pos} appearance="removed" />)
    })
    rows.push((<Row>
      <Cell><Text>Comments</Text></Cell>
      <Cell><Text>{titleAnalysis.score}</Text></Cell>
      <Cell><Text>{titleAnalysis.comparative.toFixed(4)}</Text></Cell>
      <Cell><Text>{words}</Text></Cell>
    </Row>))
  }
  


  var image = "http://willpowell.co.uk/jira/neutral.png"
  if(count > 6){
    image = "http://willpowell.co.uk/jira/positive.png"
  }else if(count >= 2){
    image = "http://willpowell.co.uk/jira/slightlypositive.png"
  }else if(count >= -2) {
    image = "http://willpowell.co.uk/jira/neutral.png"
  }
  else if(count >= -6) {
    image = "http://willpowell.co.uk/jira/slightlynegative.png"
  }else{
    image = "http://willpowell.co.uk/jira/negative.png"
  }
  if(rows.length > 0){
    bodyElements.push(" ");
    titleElements.push(" ");
    return (
      <Fragment>
        <Image src={image} alt="Sentiment Score"/>
        <Button
        text={`View Breakdown`}
        onClick={() => setOpen(true)}
      />
      {isOpen && (
        <ModalDialog header="Ticket Sentiment" onClose={() => setOpen(false)}>
          <Text>{titleElements}</Text>
          <Text>{bodyElements}</Text>
          <Text> </Text>
          <Table>
            <Head>
              <Cell><Text>Area</Text></Cell>
              <Cell><Text>Score</Text></Cell>
              <Cell><Text>Weighted</Text></Cell>
              <Cell><Text>Words</Text></Cell>
            </Head>
            {rows}
          </Table>
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
